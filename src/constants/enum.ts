const teacherStatusEnum = ["active", "inactive", "sacked", "resigned"];
const genderEnum = ["male", "female", "others"];
const rolesEnum = [
  "admin",
  "student",
  "teacher",
  "parent",
  "super_admin",
  "non_teaching",
];
const mandatedSuperAdmins = [
  "ayodejiadebolu@gmail.com",
  "agbetuyiolawande@gmail.com",
  "topzyray009@gmail.com",
];
const testTypeEnum = ["first_test", "second_test", "exam"];
const enrolmentEnum = ["enrolled", "completed", "to_repeat"];
const attendanceEnum = ["present", "absent"];
const verificationEnum = ["email_verification", "password_reset"];
const termEnum = ["first_term", "second_term", "third_term"];
const gradeEnum = [null, "A", "B", "C", "D", "E", "F"];
const studentStatusEnum = ["active", "graduated", "expelled"];
const busTripEnum = ["both_trips", "single_trip"];
const busRouteEnum = ["morning", "afternoon"];
const paymentEnum = ["cash", "bank"];
const paymentStatusEnum = ["pending", "confirmed", "declined"];
const subjectTypeEnum = ["compulsory", "optional"];
const subjectTierEnum = ["jss_section", "sss_section"];
const finalResultStatusEnum = ["promoted", "repeat", "withdrawn", "graduated"];
const nonTeachingEnum = ["bursar", "counselor", "gateman", "admin_officer"];
const streamEnum = [
  "art",
  "science",
  "commercial",
  "commercial/art",
  "science/commercial",
  "all_sss_only",
  "all_jss_only",
  "others",
];

const subscriptionEnum = ["basic", "essential", "pro", "advanced"] as const;

const examStatusEnum = ["not-started", "in-progress", "submitted", "ended"];

const triggerTypeEnum = ["manual", "time_up", "cutoff"];

const examKeyEnum = ["obj", "theory"];

const partyRoleEnum = ["sender", "beneficiary"];

const transactionStatusEnum = ["pending", "success", "failed"] as const;

const transactionTypeEnum = ["credit", "debit"];

const transactionChannelEnum = ["webhook", "manual", "fee_payment", "transfer"];

const requiredStatusesEnum = [
  "subject_scores_completed",
  "cumulative_calculated",
  "grades_assigned",
  "class_position_calculated",
  "effective_recorded",
];
export {
  attendanceEnum,
  busRouteEnum,
  busTripEnum,
  enrolmentEnum,
  examKeyEnum,
  examStatusEnum,
  finalResultStatusEnum,
  genderEnum,
  gradeEnum,
  mandatedSuperAdmins,
  nonTeachingEnum,
  partyRoleEnum,
  paymentEnum,
  paymentStatusEnum,
  requiredStatusesEnum,
  rolesEnum,
  // companyRoles,
  streamEnum,
  studentStatusEnum,
  subjectTierEnum,
  subjectTypeEnum,
  subscriptionEnum,
  teacherStatusEnum,
  termEnum,
  testTypeEnum,
  transactionChannelEnum,
  transactionStatusEnum,
  transactionTypeEnum,
  triggerTypeEnum,
  verificationEnum,
};
