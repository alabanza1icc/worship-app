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

interface EventAssignmentEmailProps {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string | null;
  roleType: string;
  appUrl: string;
}

export function EventAssignmentEmail({
  userName,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  roleType,
  appUrl,
}: EventAssignmentEmailProps) {
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
              Fuiste asignado a un evento
            </Heading>
            <Text style={text}>
              Hola {userName}, has sido asignado al siguiente evento:
            </Text>

            <Section style={eventCard}>
              <Text style={eventTitleStyle}>{eventTitle}</Text>
              <Text style={eventMeta}>
                <span style={metaIcon}>📅</span> {eventDate}
              </Text>
              <Text style={eventMeta}>
                <span style={metaIcon}>🕐</span> {eventTime}
              </Text>
              {eventLocation && (
                <Text style={eventMeta}>
                  <span style={metaIcon}>📍</span> {eventLocation}
                </Text>
              )}
              <Text style={roleBadgeContainer}>
                <span style={roleBadge}>{roleType}</span>
              </Text>
            </Section>

            <Text style={text}>
              Recuerda confirmar tu asistencia desde la app para que el líder
              sepa que estás disponible.
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

const eventCard: React.CSSProperties = {
  backgroundColor: "rgba(99,102,241,0.1)",
  border: "1px solid rgba(99,102,241,0.25)",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
};

const eventTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#f8fafc",
  margin: "0 0 12px",
};

const eventMeta: React.CSSProperties = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.6)",
  margin: "0 0 6px",
};

const metaIcon: React.CSSProperties = {
  marginRight: "6px",
};

const roleBadgeContainer: React.CSSProperties = {
  margin: "12px 0 0",
};

const roleBadge: React.CSSProperties = {
  backgroundColor: "rgba(99,102,241,0.2)",
  color: "#818cf8",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: "500",
};

const ctaSection: React.CSSProperties = { textAlign: "center", marginTop: "8px" };

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
