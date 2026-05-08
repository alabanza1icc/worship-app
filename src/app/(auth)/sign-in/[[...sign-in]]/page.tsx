import { SignIn } from "@clerk/nextjs";
import { Music } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden selection:bg-primary/10 selection:text-primary">
      {/* Mesh Background */}
      <div className="fixed inset-0 -z-10 mesh-gradient opacity-60" />
      
      <div className="w-full max-w-md space-y-8 animate-fade-in relative">
        <div className="text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-primary-glow group-hover:scale-110 transition-transform">
              <Music className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-on-surface font-headline">
              Worship<span className="text-primary">App</span>
            </span>
          </Link>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-black font-headline text-on-surface">Bienvenido de nuevo</h1>
            <p className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">
              Excelencia en cada nota
            </p>
          </div>
        </div>

        <div className="bg-glass rounded-[40px] p-2 shadow-card-md border border-white/40 overflow-hidden">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent border-none shadow-none p-4",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "rounded-2xl border-outline-variant/20 bg-white hover:bg-surface-container/50 text-on-surface font-bold text-sm h-12 transition-all",
                formButtonPrimary: "rounded-2xl bg-primary hover:bg-primary/90 text-sm font-black uppercase tracking-widest shadow-primary-glow h-12 transition-all",
                formFieldInput: "rounded-2xl border-outline-variant/20 bg-surface-container/30 px-4 py-3 text-on-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all h-12",
                footerActionText: "text-on-surface-variant font-medium",
                footerActionLink: "text-primary font-bold hover:text-primary/80 transition-colors",
                dividerLine: "bg-outline-variant/20",
                dividerText: "text-on-surface-variant/40 font-bold uppercase text-[10px] tracking-widest",
                identityPreviewText: "text-on-surface font-bold",
                formFieldLabel: "text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1 mb-1.5",
              }
            }}
          />
        </div>

        <div className="text-center">
          <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
            WorshipApp © 2026
          </p>
        </div>
      </div>
    </div>
  );
}