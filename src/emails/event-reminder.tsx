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

interface EventReminderEmailProps {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string | null;
  daysUntil: number;
  appUrl: string;
}

export function EventReminderEmail({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  daysUntil,
  appUrl,
}: EventReminderEmailProps) {
  const reminderText =
    daysUntil === 0
      ? "es hoy"
      : daysUntil === 1
        ? "es mañana"
        : `es en ${daysUntil} días`;

  return (
    <Html lang="es">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>WorshipApp</Heading>
          </Section>

          <Section style={content}>
            <Section style={reminderBadge}>
              <Text style={reminderText_}>Recordatorio — El evento {reminderText}</Text>
            </Section>

            <Heading as="h1" style={h1}>
              {eventTitle}
            </Heading>

            <Text style={text}>
              Hola {userName}, te recordamos que participas en este evento.
            </Text>

            <Section style={detailsCard}>
              <Text style={detailRow}>
                <span style={detailIcon}>📅</span>
                <span style={detailValue}>{eventDate}</span>
              </Text>
              <Text style={detailRow}>
                <span style={detailIcon}>🕐</span>
                <span style={detailValue}>{eventTime}</span>
              </Text>
              {eventLocation && (
                <Text style={detailRow}>
                  <span style={detailIcon}>📍</span>
                  <span style={detailValue}>{eventLocation}</span>
                </Text>
              )}
            </Section>

            <Text style={tip}>
              Revisa el setlist y los cifrados con anticipación para llegar
              preparado.
            </Text>

            <Section style={ctaSection}>
              <Button href={appUrl} style={button}>
                Ver evento
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section>
            <Text style={footer}>WorshipApp — Equipo de ministerio</Text>
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

const reminderBadge: React.CSSProperties = {
  backgroundColor: "rgba(245,158,11,0.1)",
  border: "1px solid rgba(245,158,11,0.25)",
  borderRadius: "8px",
  padding: "8px 16px",
  marginBottom: "20px",
  display: "inline-block",
};

const reminderText_: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#fbbf24",
  margin: 0,
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

const detailsCard: React.CSSProperties = {
  backgroundColor: "rgba(99,102,241,0.08)",
  border: "1px solid rgba(99,102,241,0.2)",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
};

const detailRow: React.CSSProperties = {
  fontSize: "15px",
  color: "#f8fafc",
  margin: "0 0 8px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const detailIcon: React.CSSProperties = {
  marginRight: "8px",
};

const detailValue: React.CSSProperties = {
  color: "#f8fafc",
};

const tip: React.CSSProperties = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.5)",
  fontStyle: "italic",
  margin: "0 0 24px",
};

const ctaSection: React.CSSProperties = { textAlign: "center" };

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
