import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const score = searchParams.get("score") ?? "0";
  const total = searchParams.get("total") ?? "5";
  const streak = searchParams.get("streak") ?? "0";
  const topic = searchParams.get("topic") ?? "Income Tax Act 2025";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a237e",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "white",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#1a237e",
              }}
            >
              T
            </span>
          </div>
          <span
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            Taxpost
          </span>
        </div>

        {/* Score */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontSize: "80px",
              fontWeight: "bold",
              color: "#ff6d00",
            }}
          >
            {score}/{total}
          </span>
        </div>

        <span
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.8)",
            marginBottom: "8px",
          }}
        >
          correct on {topic}
        </span>

        {/* Streak */}
        {Number(streak) > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "20px",
              backgroundColor: "rgba(255,109,0,0.2)",
              padding: "12px 24px",
              borderRadius: "12px",
            }}
          >
            <span style={{ fontSize: "28px" }}>&#x1f525;</span>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ff6d00",
              }}
            >
              {streak}-day streak
            </span>
          </div>
        )}

        {/* Tagline */}
        <span
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
            marginTop: "40px",
          }}
        >
          Master India&apos;s Income Tax Act 2025 — taxpost.in
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
