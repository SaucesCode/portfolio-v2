import { categoryLabels, caseStudies, getProject, projects, type Project } from '@/data/projects';
import { services } from '@/data/services';
import { site } from '@/data/site';
import { formatUsd, terms } from '@/data/terms';
import { getBaseUrl } from '@/lib/seo';

// A plain-text map of the site for language models (https://llmstxt.org), built from the same
// data as the pages so it never drifts from them.
export const dynamic = 'force-static';

const describe = (project: Project) =>
  `${project.medium}, ${project.year}. ${project.summary} ${project.provenance}.${project.note ? ` ${project.note}` : ''}`;

export function GET() {
  const baseUrl = getBaseUrl();
  const others = projects.filter((project) => !project.caseStudy);

  const body = `# ${site.name}

> ${site.name} is a ${site.role.toLowerCase()} based in the ${site.country}, designing and building custom web applications, business systems, APIs and databases, WordPress sites and themes, and websites, from data model to interface.

${site.availability}

Stack: Django and Node.js on the server, PostgreSQL for data, React and Next.js for interfaces, and PHP for WordPress block themes. The source code for each project is public on GitHub as ${site.githubHandle}. Each project below states where it comes from, such as a personal project or a concept build for a fictional brand.

## Services

${services
  .map((service) => {
    const examples = service.examples.map((slug) => getProject(slug).title).join(' and ');
    const price = service.fromUsd ? ` From ${formatUsd(service.fromUsd)}.` : '';
    return `- ${service.name}: ${service.description} Examples: ${examples}.${price}`;
  })
  .join('\n')}

## Working with me

${terms.map((term) => `- ${term.title}: ${term.body}`).join('\n')}

## Case studies

${caseStudies.map((project) => `- [${project.title}](${baseUrl}${project.caseStudy}): ${describe(project)}`).join('\n')}

## Other work

${others
  .map((project) => `- [${project.title}](${project.links[0].href}) (${categoryLabels[project.category]}): ${describe(project)}`)
  .join('\n')}

## Contact

- Website: ${baseUrl}/
- Email: ${site.email}
- GitHub: ${site.github}
- LinkedIn: ${site.linkedin}
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
