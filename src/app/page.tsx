import Link from "next/link";
import Image from "next/image";
import { 
  CalendarDays, 
  Music, 
  Users, 
  Radio, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  ArrowRight,
  Monitor,
  Smartphone,
  Zap,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-on-surface font-body selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      {/* Mesh Background */}
      <div className="fixed inset-0 -z-10 mesh-gradient opacity-60" />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-glass rounded-[24px] px-6 py-3 flex items-center justify-between shadow-card-md border border-white/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-primary-glow">
                <Music className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-on-surface font-headline">
                Worship<span className="text-primary">App</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Características</a>
              <a href="#live-mode" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Modo En Vivo</a>
              <a href="#team" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Ministerio</a>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/sign-in" className="hidden sm:block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                Ingresar
              </Link>
              <Link href="/sign-up">
                <Button className="rounded-xl px-5 py-2.5 shadow-primary-glow h-auto text-xs uppercase tracking-widest font-black">
                  Probar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="relative z-10 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
                <Sparkles className="h-3.5 w-3.5" />
                La evolución del ministerio musical
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black font-headline tracking-tight text-on-surface leading-[1.1]">
                Eleva la <span className="text-primary relative inline-block">
                  Excelencia
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                </span> de tu Alabanza.
              </h1>
              
              <p className="text-lg text-on-surface-variant font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                WorshipApp centraliza la planificación, el repertorio y la ejecución en vivo en una plataforma premium diseñada para directores y músicos.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/sign-up">
                  <Button className="rounded-[20px] px-8 py-7 text-sm uppercase tracking-widest font-black shadow-primary-glow flex items-center gap-2 group h-auto">
                    Comenzar Ahora
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" className="rounded-[20px] px-8 py-7 text-sm uppercase tracking-widest font-black h-auto hover:bg-white/50 border border-transparent hover:border-outline-variant/20 transition-all">
                    Explorar Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-surface-container flex items-center justify-center overflow-hidden shadow-sm">
                      <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" width={40} height={40} />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-on-surface tracking-wide">+500 Equipos</div>
                  <div className="text-[10px] font-bold text-on-surface-variant/60 uppercase">Ya están transformando sus servicios</div>
                </div>
              </div>
            </div>

            {/* Right Mockup */}
            <div className="relative animate-float lg:block">
              <div className="absolute -inset-4 bg-primary/20 rounded-[40px] blur-3xl opacity-20" />
              <div className="relative rounded-[32px] border border-white/40 bg-glass p-2 shadow-card-md">
                <div className="rounded-[24px] overflow-hidden border border-outline-variant/10 shadow-2xl">
                  <Image 
                    src="/worship_app_dashboard_mockup_1778279927583.png" 
                    alt="Dashboard Preview" 
                    width={800} 
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 bg-glass px-5 py-3 rounded-[20px] shadow-card border border-white/50 flex items-center gap-3 animate-float delay-1000">
                  <div className="w-10 h-10 rounded-xl bg-destructive flex items-center justify-center shadow-destructive-glow">
                    <Radio className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-on-surface-variant">Modo En Vivo</div>
                    <div className="text-xs font-bold text-on-surface">Servicio Dominical</div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-glass px-5 py-3 rounded-[20px] shadow-card border border-white/50 flex items-center gap-3 animate-float delay-2000">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-primary-glow">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-on-surface-variant">Way Maker</div>
                    <div className="text-xs font-bold text-on-surface">Tono: La Mayor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Funcionalidades</h2>
            <h3 className="text-4xl lg:text-5xl font-black font-headline tracking-tight text-on-surface leading-tight">
              Diseñado para la excelencia.
            </h3>
            <p className="text-on-surface-variant max-w-2xl mx-auto font-medium">
              Todo lo que necesitas para gestionar tu ministerio musical desde la nube, con una interfaz intuitiva y premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: CalendarDays, 
                title: "Planificación Pro", 
                desc: "Crea eventos, ensayos y servicios con facilidad. Gestiona setlists y notas de dirección.",
                color: "bg-primary/10 text-primary"
              },
              { 
                icon: Music, 
                title: "Repertorio Inteligente", 
                desc: "Almacena tus canciones con cifrados dinámicos, transporta tonos y adjunta archivos.",
                color: "bg-primary/10 text-primary"
              },
              { 
                icon: Users, 
                title: "Gestión de Equipo", 
                desc: "Asigna roles específicos por instrumento, confirma asistencia y mantén a todos alineados.",
                color: "bg-primary/10 text-primary"
              },
              { 
                icon: Radio, 
                title: "Live Mode Suite", 
                desc: "Presentación fullscreen de letras y acordes para músicos y multimedia en tiempo real.",
                color: "bg-destructive/10 text-destructive"
              }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-[32px] border border-outline-variant/20 bg-glass hover:bg-white hover:border-primary/40 hover:shadow-card-md transition-all duration-500">
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                  <f.icon className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold font-headline text-on-surface mb-3">{f.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Mode Focus */}
      <section id="live-mode" className="py-24 relative overflow-hidden bg-surface-container/30 border-y border-outline-variant/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-primary/30 rounded-[40px] blur-3xl opacity-20" />
              <div className="relative rounded-[32px] border border-outline-variant/20 bg-white p-4 shadow-2xl overflow-hidden">
                <div className="bg-on-surface rounded-[20px] aspect-video flex items-center justify-center relative overflow-hidden p-8 group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-center space-y-4">
                    <h4 className="text-white font-mono text-2xl lg:text-3xl font-bold leading-relaxed">
                      [La] Cantaré de Tu <span className="text-primary">bondad</span><br/>
                      [Mi] Esperaré en Ti
                    </h4>
                    <div className="flex justify-center gap-2 pt-8">
                      <div className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest border border-white/5">-1</div>
                      <div className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-primary-glow">+2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/5 border border-destructive/10 text-destructive text-[10px] font-black uppercase tracking-[0.2em]">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Ejecución Impecable
              </div>
              <h3 className="text-4xl lg:text-5xl font-black font-headline tracking-tight text-on-surface leading-tight">
                El Escenario es <br/><span className="text-primary">Tu Nueva Oficina.</span>
              </h3>
              <p className="text-lg text-on-surface-variant font-medium leading-relaxed">
                El Modo En Vivo está diseñado para la máxima concentración. Olvida las carpetas físicas y los PDF estáticos.
              </p>
              <ul className="space-y-4">
                {[
                  "Transposición instantánea de tonos",
                  "Pantalla siempre encendida para músicos",
                  "Vista limpia para multimedia",
                  "Sincronización en tiempo real con el setlist"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-on-surface">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link href="/sign-up">
                  <Button className="rounded-2xl px-8 py-6 text-xs uppercase tracking-widest font-black shadow-primary-glow h-auto group">
                    Probar el Modo En Vivo
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team / ministry section */}
      <section id="team" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-glass rounded-[48px] p-8 lg:p-20 border border-white/50 shadow-card-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h3 className="text-4xl lg:text-5xl font-black font-headline tracking-tight text-on-surface leading-tight">
                  Construye un Equipo <br/><span className="text-primary">Conectado.</span>
                </h3>
                <p className="text-lg text-on-surface-variant font-medium leading-relaxed">
                  Elimina la confusión de WhatsApp y los correos perdidos. WorshipApp es el hub central donde todos los ministerios convergen.
                </p>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Smartphone, title: "Mobile First", desc: "Todo el equipo puede acceder desde su teléfono." },
                    { icon: Zap, title: "Notificaciones", desc: "Alertas instantáneas para cambios en el setlist." },
                    { icon: Globe, title: "Cloud Sync", desc: "Datos siempre actualizados y sincronizados." },
                    { icon: Monitor, title: "Web Dashboard", desc: "Interfaz potente para administradores." }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h5 className="font-bold text-on-surface text-sm">{item.title}</h5>
                      <p className="text-xs text-on-surface-variant font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Dirección", role: "Voz Principal", img: "11" },
                    { name: "Instrumentos", role: "Piano / Guitarras", img: "12" },
                    { name: "Multimedia", role: "Proyección de Letras", img: "13" },
                    { name: "Danza", role: "Coreografía", img: "14" }
                  ].map((member, i) => (
                    <div key={i} className={cn(
                      "p-6 rounded-[32px] bg-white shadow-card border border-outline-variant/10 flex flex-col items-center text-center space-y-3",
                      i % 2 === 1 ? "translate-y-8" : ""
                    )}>
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                        <Image src={`https://i.pravatar.cc/150?img=${member.img}`} alt={member.name} width={64} height={64} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-on-surface">{member.name}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="mx-auto max-w-4xl px-4 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-primary-glow">
            Comienza Hoy
          </div>
          <h2 className="text-5xl lg:text-6xl font-black font-headline tracking-tight text-on-surface leading-tight">
            ¿Listo para llevar tu ministerio <br/>al <span className="text-primary">siguiente nivel?</span>
          </h2>
          <p className="text-lg text-on-surface-variant font-medium max-w-2xl mx-auto">
            Únete a cientos de equipos que ya usan WorshipApp para servir con excelencia y orden.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button className="rounded-[24px] px-10 py-8 text-sm uppercase tracking-widest font-black shadow-primary-glow h-auto group">
                Registrar mi Iglesia
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-outline-variant/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-primary-glow">
                <Music className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-on-surface font-headline">
                Worship<span className="text-primary">App</span>
              </span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.3em]">
              © 2026 WorshipApp — Excelencia en cada nota.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
