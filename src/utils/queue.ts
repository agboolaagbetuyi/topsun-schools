import { Job, Queue, Worker } from "bullmq";
import { Redis, RedisOptions } from "ioredis";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import {
  resendSendChildLinkageMail,
  resendSendEmailVerification,
  resendSendParentSessionNotification,
  resendSendPasswordReset,
  resendSendStudentSessionNotification,
} from "./resend";
import {
  EmailJobData,
  CbtAssessmentJobData,
  ResultJobData,
  SubjectCumScoreJobData,
  SubjectPositionJobData,
  CbtAssessmentEndedType,
  CbtAssessmentResultType,
} from "../constants/types";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import {
  processCbtAssessmentResultSubmission,
  processCbtAssessmentSubmission,
  processStudentExamResultUpdate,
  processStudentResultUpdate,
  processStudentSubjectPositionUpdate,
  processSubjectCumScoreUpdate,
} from "../repository/result.repository";
import { sendEmailVerification } from "./nodemailer";

const isDocker = process.env.DOCKER_ENV === "true";

const redisUrl = process.env.REDIS_URL;

console.log("redisUrl:", redisUrl);

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined...");
}

const redisConnectionString = redisUrl.replace("redis://", "");

const [host, port] = redisConnectionString.split(":");

const redisOptions: RedisOptions = {
  host: host,
  port: parseInt(port || "6379", 10),
  maxRetriesPerRequest: null,
};

const connection = new Redis(redisOptions);

const emailQueue = new Queue("emailQueue", { connection });

const emailWorker = new Worker<EmailJobData>(
  "emailQueue",
  async (job: Job<EmailJobData>) => {
    const {
      child_email,
      child_name,
      academic_session,
      option,
      email,
      first_name,
      token,
      type,
      title,
      message,
    } = job.data;

    if (type === "email-verification") {
      if (!token) {
        throw new Error("Token is required for email verification");
      }

      const sendEmail = await resendSendEmailVerification({
        email,
        first_name,
        token,
      });

      return sendEmail;
    } else if (type === "forgot-password") {
      if (!token) {
        throw new Error("Token is required for forgot password");
      }

      const sendEmail = await resendSendPasswordReset({
        email,
        first_name,
        token,
      });

      return sendEmail;
    } else if (type === "child-linkage") {
      const sendEmail = await resendSendChildLinkageMail({
        email,
        first_name,
        title,
        message,
      });

      return sendEmail;
    } else if (type === "session-subscription") {
      let sendEmail;
      if (option === "student") {
        sendEmail = await resendSendStudentSessionNotification({
          email,
          first_name,
          academic_session,
        });
      } else if (option === "parent") {
        sendEmail = await resendSendParentSessionNotification({
          first_name,
          child_name,
          child_email,
          email,
          academic_session,
        });
      }

      return sendEmail;
    }
  },
  // { connection }
  {
    connection,
    concurrency: 20,
    maxStalledCount: 2,
    lockDuration: 120000,
    lockRenewTime: 30000,
  }
);

const studentResultQueue = new Queue("studentResultQueue", { connection });
const resultWorker = new Worker<
  | ResultJobData
  | CbtAssessmentJobData
  | SubjectPositionJobData
  | SubjectCumScoreJobData
  | CbtAssessmentEndedType
  | CbtAssessmentResultType
>(
  "studentResultQueue",
  async (job) => {
    switch (job.name) {
      case "update-student-result":
        await processStudentResultUpdate(job.data as ResultJobData);

        break;
      case "update-student-exam":
        await processStudentExamResultUpdate(job.data as CbtAssessmentJobData);
        break;
      case "subject-position":
        await processStudentSubjectPositionUpdate(
          job.data as SubjectPositionJobData
        );
        break;
      case "update-cum-score":
        await processSubjectCumScoreUpdate(job.data as SubjectCumScoreJobData);
        break;
      case "cbt-assessment-submission":
        await processCbtAssessmentSubmission(
          job.data as CbtAssessmentEndedType
        );
        break;
      case "cbt-result-submission":
        await processCbtAssessmentResultSubmission(
          job.data as CbtAssessmentResultType
        );
        break;

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 100,
    maxStalledCount: 2,
    lockDuration: 120000,
    lockRenewTime: 30000,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} has been completed`);
});

emailWorker.on("failed", (job: Job<EmailJobData> | undefined, err: Error) => {
  if (job) {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  } else {
    console.error(`failed to process job due to error: ${err.message}`);
  }
});

resultWorker.on("active", (job) => {
  console.log(
    `Processing Job ID ${job.id} | Attempt ${job.attemptsMade + 1} of ${
      job.opts.attempts ?? 1
    }`
  );
});
resultWorker.on("completed", (job) => {
  console.log(`Job ${job.id} has been completed`);
});

resultWorker.on(
  "failed",
  (
    job:
      | Job<
          | ResultJobData
          | CbtAssessmentJobData
          | SubjectPositionJobData
          | SubjectCumScoreJobData
          | CbtAssessmentEndedType
          | CbtAssessmentResultType
        >
      | undefined,
    err: Error
  ) => {
    if (job) {
      console.error(
        `Job ${job.id} failed on attempt ${job.attemptsMade + 1} with error: ${
          err.message
        }`
      );
    } else {
      console.error(`failed to process job due to error: ${err.message}`);
    }
  }
);

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(studentResultQueue),
  ],
  serverAdapter,
});

serverAdapter.setBasePath("/bull-board");

export {
  emailQueue,
  studentResultQueue,
  emailWorker,
  serverAdapter,
  connection,
};
