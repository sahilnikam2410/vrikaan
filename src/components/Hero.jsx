import React from "react";

export default function Hero() {

  return (
<section
style={{
minHeight:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
padding:"0 clamp(40px,6vw,120px)"
}}
>

      <div style={{ maxWidth: 700 }}>

        <h1
          style={{
            fontSize: "clamp(40px,6vw,80px)",
            fontFamily: "var(--display)",
            fontWeight: 300,
            lineHeight: 1.05
          }}
        >
          The Future of
          <br />
          <span style={{ color: "#14b8a6" }}>
            Cyber Defense
          </span>
        </h1>

        <p
          style={{
            marginTop: 24,
            fontSize: 18,
            opacity: 0.7,
            lineHeight: 1.6
          }}
        >
          AI-powered protection against fraud, hacking,
          phishing and identity theft for real people.
        </p>

      </div>

    </section>
  );
}