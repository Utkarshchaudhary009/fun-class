import { verifyWebhook } from "@clerk/nextjs/webhooks";
import Profile from "@/models/profile";
import { UserJSON } from "@clerk/nextjs/server";
import { ProfileType, ZProfile } from "@/lib/types/profile.types";
import { Question } from "@/models/question";
import { UserGameAnswer } from "@/models/userGameAnswer";
import { sendEmailToAdmin } from "@/utils/Mailer/Mailer";

export const upsertProfile = async (data: UserJSON) => {
  try {
    const {
      id,
      first_name,
      last_name,
      password_last_updated_at,
      public_metadata,
      username,
      private_metadata,
      last_active_at,
      email_addresses,
      image_url,
      phone_numbers,
    } = data;

    // Check if the user already exists in the database
    const existingProfile = await Profile.findOne({ userId: id });
    if (existingProfile) {
      await Profile.updateOne({ userId: id }, { $set: data });
      return existingProfile;
    }

    const profile: ProfileType = {
      userId: id,
      firstName: first_name || "Unknown",
      lastName: last_name || "Unknown",
      fullName: `${first_name} ${last_name}` || username || "Unknown",
      email: email_addresses[0].email_address || "Unknown",
      profilePicture: image_url || "",
      phoneNumber: phone_numbers[0].phone_number || "",
      lastActiveAt: last_active_at || new Date().getTime(),
      address: "",
      public_metadata: public_metadata as Record<string, string | number>,
      private_metadata: private_metadata as Record<string, string | number>,
      password_last_updated_at:
        password_last_updated_at || new Date().getTime(),
      xp: 0,
      level: 1,
      bookmarks: [],
      gameHistory: [],
    };
    let parsedProfile: ProfileType = profile;
    try {
      parsedProfile = ZProfile.parse(profile);
    } catch (error) {
      console.error(error);
      sendEmailToAdmin(
        "WEBHOOK",
        "Error parsing profile",
        "Error parsing profile",
        `Error parsing profile: ${error}`
      );
    }
    const newProfile = new Profile(parsedProfile);
    await newProfile.save();
    return newProfile;
  } catch (error) {
    console.error(error);
    sendEmailToAdmin(
      "WEBHOOK",
      "Error upserting profile",
      "Error upserting profile",
      `Error upserting profile: ${error}`
    );
    throw error;
  }
};
export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      console.log("userId:", evt.data.id);
      await upsertProfile(evt.data);
    }
    if (evt.type === "user.deleted") {
      console.log("userId:", evt.data.id);
      await Profile.deleteOne({ userId: evt.data.id });
      await Question.deleteMany({ userId: evt.data.id });
      await UserGameAnswer.deleteMany({ userId: evt.data.id });
    }
    sendEmailToAdmin(
      "WEBHOOK",
      "Successfully processed webhook",
      evt.type.replace(".", " ").toUpperCase(),
      `User ${evt.data.id} has been ${evt.type.replace(".", " ").toUpperCase()}\n\nData: ${JSON.stringify(evt.data)}`
    );
    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    sendEmailToAdmin(
      "WEBHOOK",
      "Error verifying webhook",
      "Error verifying webhook",
      `Error verifying webhook: ${err}`
    );
    return new Response("Error verifying webhook", { status: 400 });
  }
}
