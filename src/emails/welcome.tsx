import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
  userName: string;
  appUrl: string;
}

export function WelcomeEmail({ userName, appUrl }: WelcomeEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>WorshipApp</Heading>
          </Section>

          <Section style={content}>
            <Heading as="h1" style={h1}>
              Bienvenido, {userName}
            </Heading>
            <Text style={text}>
              Nos alegra tenerte como parte del equipo de ministerio. WorshipApp
              es tu herramienta para mantenerte organizado y conectado con toda
              la programación.
            </Text>

            <Text style={featureTitle}>¿Qué puedes hacer?</Text>

            <Text style={feature}>
              <strong style={featureName}>Eventos</strong> — Accede a todos los
              servicios y ensayos en los que participas.
            </Text>
            <Text style={feature}>
              <strong style={featureName}>Canciones</strong> — Visualiza
              cifrados, letras y pistas de audio.
            </Text>
            <Text style={feature}>
              <strong style={featureName}>Modo En Vivo</strong> — Presenta
              canciones con cifrado transponible en tiempo real.
            </Text>
            <Text style={feature}>
              <strong style={featureName}>Calendario</strong> — Planifica tu
              agenda con todos los eventos del ministerio.
            </Text>

            <Section style={ctaSection}>
              <Button href={appUrl} style={button}>
                Acceder a WorshipApp
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section>
            <Text style={footer}>
              Este mensaje fue enviado porque fuiste invitado a WorshipApp.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#030303",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: "20px",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
};

const header: React.CSSProperties = {
  textAlign: "center",
  padding: "32px 0 16px",
};

const logo: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  WebkitBackgroundClip: "text",
  color: "#6366f1",
  margin: 0,
};

const content: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "32px",
  marginTop: "16px",
};

const h1: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#f8fafc",
  margin: "0 0 16px",
};

const text: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "rgba(255,255,255,0.7)",
  margin: "0 0 24px",
};

const featureTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "600",
  color: "rgba(255,255,255,0.4)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  margin: "0 0 12px",
};

const feature: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "rgba(255,255,255,0.7)",
  margin: "0 0 10px",
  paddingLeft: "12px",
  borderLeft: "2px solid #6366f1",
};

const featureName: React.CSSProperties = {
  color: "#f8fafc",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  marginTop: "32px",
};

const button: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
};

const divider: React.CSSProperties = {
  borderColor: "rgba(255,255,255,0.08)",
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.3)",
  textAlign: "center",
  margin: 0,
};
