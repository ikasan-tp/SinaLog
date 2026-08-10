import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ContactForm } from "./contact-form";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <h1 className="mb-2 text-xl font-bold">お問い合わせ</h1>
        <p className="mb-7 text-pretty text-[13px] text-ink-sub">
          不具合報告・ご要望・その他ご質問はこちらから送信してください。ログインは不要です。匿名での送信も可能です。
        </p>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
