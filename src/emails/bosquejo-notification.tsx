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

interface BosquejoNotificationEmailProps {
  userName: string;
  leaderName: string;
  eventTitle: string;
  eventDate: string;
  q1Respuesta: string;
  q2Respuesta: string;
  notasAdicionales: string | null;
  appUrl: string;
}

export function BosquejoNotificationEmail({
  userName,
  leaderName,
  eventTitle,
  eventDate,
  q1Respuesta,
  q2Respuesta,
  notasAdicionales,
  appUrl,
}: BosquejoNotificationEmailProps) {
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
              Bosquejo del evento compartido
            </Heading>
            <Text style={text}>
              Hola {userName}, {leaderName} compartió el bosquejo espiritual
              para el siguiente evento:
            </Text>

            <Section style={eventHeader}>
              <Text style={eventTitleStyle}>{eventTitle}</Text>
              <Text style={eventDateStyle}>{eventDate}</Text>
            </Section>

            <Section style={questionSection}>
              <Text style={questionLabel}>
                ¿Qué versículo o mensaje de Dios guía esta programación?
              </Text>
              <Text style={questionAnswer}>{q1Respuesta}</Text>
            </Section>

            <Section style={questionSection}>
              <Text style={questionLabel}>
                ¿Cómo conectan las canciones seleccionadas con este mensaje?
              </Text>
              <Text style={questionAnswer}>{q2Respuesta}</Text>
            </Section>

            {notasAdicionales && (
              <Section style={notesSection}>
                <Text style={notesLabel}>Notas adicionales</Text>
                <Text style={notesText}>{notasAdicionales}</Text>
              </Section>
            )}

            <Section style={ctaSection}>
              <Button href={appUrl} style={button}>
                Ver evento completo
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section>
            <Text style={footer}>
              WorshipApp — Este mensaje fue enviado a todos los participantes
              del evento.
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

const container: React.CSSProperties = { maxWidth: "600px", margin: "0 auto" };

const header: React.CSSProperties = {
  textAlign: "center",
  padding: "32px 0 16px",
};

const logo: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
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
  fontSize: "22px",
  fontWeight: "600",
  color: "#f8fafc",
  margin: "0 0 12px",
};

const text: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "rgba(255,255,255,0.7)",
  margin: "0 0 20px",
};

const eventHeader: React.CSSProperties = {
  borderLeft: "3px solid #6366f1",
  paddingLeft: "16px",
  marginBottom: "24px",
};

const eventTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#f8fafc",
  margin: "0 0 4px",
};

const eventDateStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.5)",
  margin: 0,
};

const questionSection: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "12px",
};

const questionLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#818cf8",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "0 0 8px",
};

const questionAnswer: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#f8fafc",
  margin: 0,
};

const notesSection: React.CSSProperties = {
  backgroundColor: "rgba(139,92,246,0.08)",
  border: "1px solid rgba(139,92,246,0.2)",
  borderRadius: "12px",
  padding: "16px",
  marginTop: "12px",
  marginBottom: "24px",
};

const notesLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#a78bfa",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "0 0 8px",
};

const notesText: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "rgba(255,255,255,0.7)",
  margin: 0,
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  marginTop: "24px",
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
