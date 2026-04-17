import { Resend } from "resend";
const resend = new Resend("re_5H4q4J4c_MQLpuvgZi9u2vMVKcXdGhrHZ");
async function test() {
  const { data, error } = await resend.emails.send({
    from: "ErrandGo <support@get2uerrand.com>",
    to: "smiletvafrica10@gmail.com",
    subject: "Test",
    html: "<p>Test</p>",
  });
  console.log("Data:", data, "Error:", error);
}
test();
