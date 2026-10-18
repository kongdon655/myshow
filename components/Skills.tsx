import type { SkillGroup } from "@/content/data/skills";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <div key={group.category} className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-semibold">{group.category}</h3>
          <ul className="mt-5 space-y-4">
            {group.skills.map((skill) => (
              <li key={skill.name}>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{skill.icon}</span>
                  <span className="font-medium">{skill.name}</span>
                  <span className="ml-auto text-sm text-muted">{skill.level}%</span>
                </div>
                <div
                  className="mt-1.5 h-1.5 rounded-full bg-surface-2"
                  role="progressbar"
                  aria-valuenow={skill.level}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${skill.name} 熟练度 ${skill.level}%`}
                >
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
