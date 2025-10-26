import ejs from "ejs";
import fs from "fs";
import path from "path";
import { Resend } from "resend";
import { EmailType } from "../constants/types";

const getMailTemplate = (filePath: string, data: {}) => {
  const templatePath = path.join(__dirname, "./templates", filePath);
  const template = fs.readFileSync(templatePath, "utf8");
  return ejs.render(template, data);
};

const resend = new Resend(process.env.RESEND_API_KEY);

const resendSendEmailVerification = async ({
  email,
  first_name,
  token,
}: EmailType) => {
  try {
    console.log("resend:", resend);
    const emailVerificationContent = getMailTemplate("emailTemplate.ejs", {
      first_name,
      token,
    });

    const { data, error } = await resend.emails.send({
      from: process.env.NODEMAILER_USER as string,
      to: email,
      subject: "Email verification",
      html: emailVerificationContent,
    });

    if (error) {
      console.log("Email resend Error:", error);
    }
    console.log("Email resend Data:", data);
    return data;
  } catch (error) {
    console.error(error);
  }
};

const resendSendPasswordReset = async ({
  email,
  first_name,
  token,
}: EmailType) => {
  try {
    const passwordResetContent = getMailTemplate("passwordResetTemplate.ejs", {
      first_name,
      token,
    });

    const { data, error } = await resend.emails.send({
      from: process.env.NODEMAILER_USER as string,
      to: email,
      subject: "Password Reset",
      html: passwordResetContent,
    });
    return data;
  } catch (error) {
    console.error(error);
  }
};

const resendSendChildLinkageMail = async ({
  email,
  first_name,
  title,
  message,
}: EmailType) => {
  try {
    const childLinkageContent = getMailTemplate("childLinkageTemplate.ejs", {
      first_name,
      title,
      message,
    });

    const { data, error } = await resend.emails.send({
      from: process.env.NODEMAILER_USER as string,
      to: email,
      subject: "Child Linkage",
      html: childLinkageContent,
    });

    return data;
  } catch (error) {
    console.error(error);
  }
};

const resendSendStudentSessionNotification = async ({
  first_name,
  email,
  academic_session,
}: EmailType) => {
  try {
    const sessionSubscriptionContent = getMailTemplate(
      "studentSessionSubscriptionTemplate.ejs",
      {
        first_name,
        academic_session,
      }
    );

    const { data, error } = await resend.emails.send({
      from: process.env.NODEMAILER_USER as string,
      to: email,
      subject: "Session Subscription Notification",
      html: sessionSubscriptionContent,
    });

    return data;
  } catch (error) {
    console.error(error);
  }
};

const resendSendParentSessionNotification = async ({
  first_name,
  child_name,
  child_email,
  email,
  academic_session,
}: EmailType) => {
  try {
    const sessionSubscriptionContent = getMailTemplate(
      "studentSessionSubscriptionByParentTemplate.ejs",
      {
        first_name,
        email,
        academic_session,
        child_name,
        child_email,
      }
    );

    const { data, error } = await resend.emails.send({
      from: process.env.NODEMAILER_USER as string,
      to: email,
      subject: "Session Subscription Notification",
      html: sessionSubscriptionContent,
    });

    console.log(`mail successfully sent to ${email}`);
    return data;
  } catch (error) {
    console.error(error);
  }
};

export {
  resendSendEmailVerification,
  resendSendPasswordReset,
  resendSendChildLinkageMail,
  resendSendStudentSessionNotification,
  resendSendParentSessionNotification,
};
