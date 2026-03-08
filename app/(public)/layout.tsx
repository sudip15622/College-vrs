import { auth } from "@/auth";
import { User } from "next-auth";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let user: User | null = null;
  if (session) {
    user = session.user;
  }

  return (
    <>
      <Navbar user={user} />
      <main className="w-full bg-card min-h-[calc(100vh-80px)] mx-auto lg:px-20 md:px-16 sm:px-10 px-4 space-y-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
