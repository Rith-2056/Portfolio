import { Portfolio } from "@/components/Portfolio";
import { profile } from "@/data/profile";
import { experiences } from "@/data/experience";
import { projects } from "@/data/projects";

/** Server-rendered, visually hidden résumé so crawlers and assistive tech get the content without WebGL. */
function StaticResume() {
  return (
    <div className="sr-only">
      <h1>{profile.name}</h1>
      <p>{profile.title}</p>
      <p>{profile.tagline}</p>
      <p>{profile.about.lead}</p>
      <h2>Experience</h2>
      {experiences.map((e) => (
        <section key={e.id}>
          <h3>
            {e.company} — {e.role} ({e.period})
          </h3>
          <ul>
            {e.accomplishments.map((a) => (
              <li key={a.id}>{a.text}</li>
            ))}
          </ul>
        </section>
      ))}
      <h2>Projects</h2>
      {projects.map((p) => (
        <section key={p.id}>
          <h3>{p.name}</h3>
          <p>{p.technologies.join(", ")}</p>
          <ul>
            {p.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      ))}
      <h2>Education</h2>
      <p>
        {profile.education.school}, {profile.education.degree}, GPA {profile.education.gpa}, expected {profile.education.graduation}
      </p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${profile.email}`}>{profile.email}</a> · <a href={profile.linkedin}>LinkedIn</a> · <a href={profile.github}>GitHub</a>
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <StaticResume />
      <Portfolio />
      <noscript>
        <div style={{ padding: 24, fontFamily: "monospace" }}>This portfolio needs JavaScript to render the interactive world.</div>
      </noscript>
    </>
  );
}
