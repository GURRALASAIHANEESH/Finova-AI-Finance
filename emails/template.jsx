import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// Dummy data for preview
const PREVIEW_DATA = {
  monthlyReport: {
    userName: "Haneesh Patel",
    type: "monthly-report",
    data: {
      month: "December",
      stats: {
        totalIncome: 5000,
        totalExpenses: 3500,
        byCategory: {
          housing: 1500,
          groceries: 600,
          transportation: 400,
          entertainment: 300,
          utilities: 700,
        },
      },
      insights: [
        "Your housing expenses are 43% of your total spending - consider reviewing your housing costs.",
        "Great job keeping entertainment expenses under control this month!",
        "Setting up automatic savings could help you save 20% of your income.",
      ],
    },
  },
  budgetAlert: {
    userName: "Haneesh Patel",
    type: "budget-alert",
    data: {
      percentageUsed: 85,
      budgetAmount: 4000,
      totalExpenses: 3400,
    },
  },
};

export default function EmailTemplate({
  userName,
  type,
  data,
}) {
  // Fallback to preview data if required fields are missing
  if (
    !userName ||
    !data ||
    !data.month ||
    !data.stats ||
    data.stats.totalIncome == null ||
    data.stats.totalExpenses == null
  ) {
    const preview = PREVIEW_DATA.monthlyReport;
    userName = preview.userName;
    type = preview.type;
    data = preview.data;
  }

  console.log("Props received:", { userName, type, data });

  if (!["monthly-report", "budget-alert"].includes(type)) {
    console.log("Invalid email type:", type);
    return (
      <Html>
        <Head />
        <Preview>Error</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Invalid Email Type</Heading>
            <Text style={styles.text}>The email type provided is not supported.</Text>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "monthly-report") {
    const missingFields = [];
    if (!userName) missingFields.push("userName");
    if (!data?.month) missingFields.push("data.month");
    if (!data?.stats?.totalIncome) missingFields.push("data.stats.totalIncome");
    if (!data?.stats?.totalExpenses) missingFields.push("data.stats.totalExpenses");

    if (missingFields.length > 0) {
      console.log(`Missing fields for monthly-report: ${missingFields.join(", ")}`);
      return (
        <Html>
          <Head />
          <Preview>Error</Preview>
          <Body style={styles.body}>
            <Container style={styles.container}>
              <Heading style={styles.title}>Monthly Financial Report</Heading>
              <Text style={styles.text}>
                Unable to generate report. Missing: {missingFields.join(", ")}. Please check your data source or contact support.
              </Text>
            </Container>
          </Body>
        </Html>
      );
    }

    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Monthly Financial Report</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              Here’s your financial summary for {data.month}:
            </Text>

            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Income</Text>
                <Text style={styles.heading}>${data.stats.totalIncome.toFixed(2)}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Expenses</Text>
                <Text style={styles.heading}>${data.stats.totalExpenses.toFixed(2)}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Net</Text>
                <Text style={styles.heading}>
                  ${(data.stats.totalIncome - data.stats.totalExpenses).toFixed(2)}
                </Text>
              </div>
            </Section>

            {data.stats.byCategory && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Expenses by Category</Heading>
                {Object.entries(data.stats.byCategory).map(([category, amount]) => (
                  <div key={category} style={styles.row}>
                    <Text style={styles.text}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <Text style={styles.text}>${amount.toFixed(2)}</Text>
                  </div>
                ))}
              </Section>
            )}

            {data.insights && data.insights.length > 0 && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Welth Insights</Heading>
                {data.insights.map((insight, index) => (
                  <Text key={index} style={styles.text}>• {insight}</Text>
                ))}
              </Section>
            )}

            <Text style={styles.footer}>
              Thank you for using Finova. Keep tracking your finances for better
              financial health!
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budget-alert") {
    const missingFields = [];
    if (!userName) missingFields.push("userName");
    if (!data?.budgetAmount) missingFields.push("data.budgetAmount");
    if (!data?.totalExpenses) missingFields.push("data.totalExpenses");

    if (missingFields.length > 0) {
      console.log(`Missing fields for budget-alert: ${missingFields.join(", ")}`);
      return (
        <Html>
          <Head />
          <Preview>Error</Preview>
          <Body style={styles.body}>
            <Container style={styles.container}>
              <Heading style={styles.title}>Budget Alert</Heading>
              <Text style={styles.text}>
                Unable to generate budget alert. Missing: {missingFields.join(", ")}.
              </Text>
            </Container>
          </Body>
        </Html>
      );
    }

    return (
      <Html>
        <Head />
        <Preview>Budget Alert</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              You’ve used{" "}
              {data.percentageUsed != null ? data.percentageUsed.toFixed(1) : "--"}% of
              your monthly budget.
            </Text>
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Budget Amount</Text>
                <Text style={styles.heading}>${data.budgetAmount.toFixed(2)}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Spent So Far</Text>
                <Text style={styles.heading}>${data.totalExpenses.toFixed(2)}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Remaining</Text>
                <Text style={styles.heading}>
                  ${(data.budgetAmount - data.totalExpenses).toFixed(2)}
                </Text>
              </div>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
}

export const EmailTemplateDemo = () => {
  const { userName, type, data } = PREVIEW_DATA.monthlyReport;
  console.log("EmailTemplateDemo props:", { userName, type, data });
  return <EmailTemplate userName={userName} type={type} data={data} />;
};

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    width: "100%",
  },
  title: {
    color: "#1f2937",
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 20px",
  },
  heading: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 16px",
  },
  section: {
    marginTop: "32px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
    border: "1px solid #e5e7eb",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
  },
  stat: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  footer: {
    color: "#4b5563",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
};