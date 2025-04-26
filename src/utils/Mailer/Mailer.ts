import { Resend } from "resend";
import { MailContent } from "./Format";
const resend = new Resend(
  process.env.RESEND_API_KEY || "re_8sphDhW8_CK6hiUiwPVw2Gpd9n75PZ5am"
);

export async function sendEmail(
  to: string,
  subject: string,
  type: string,
  header: string,
  content: string
) {
  const { data, error } = await resend.emails.send({
    from: "Fun Study App <onboarding@resend.dev>",
    to: to || "workingwithourshop@gmail.com",
    subject,
    react: MailContent({ type, header, content }),
  });

  if (error) {
    console.error(error);
    return { error: error.message };
  }
  return data;
}

export async function sendEmailToAdmin(
  subject: string,
  type: string,
  header: string,
  content: string
) {
  const to = "utkarshchaudhary426@gmail.com";
  const data = await sendEmail(to, subject, type, header, content);
  console.log(data);
  return data;
}
