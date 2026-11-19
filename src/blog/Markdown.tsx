import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

// A small Markdown reader for blog articles: ## and ### headings, paragraphs, - and 1. lists, > quotes, ---, | tables |,
// **bold**, *italic*, `code` and [links](url). Builds React elements (no raw HTML), so an article can't break the page.

function inline(text: string, key = ''): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((\S+?)\)/g;
  let last = 0, m: RegExpExecArray | null, n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${n++}`;
    if (m[1] !== undefined) out.push(<strong key={k}>{inline(m[1], k)}</strong>);
    else if (m[2] !== undefined) out.push(<em key={k}>{inline(m[2], k)}</em>);
    else if (m[3] !== undefined) out.push(<code key={k}>{m[3]}</code>);
    else {
      const href = m[5];
      out.push(href.startsWith('/') && !href.startsWith('//')
        ? <Link key={k} to={href}>{inline(m[4], k)}</Link>
        : <a key={k} href={href} {...(/^https?:/.test(href) && !href.includes('curivanta.com') ? { target: '_blank', rel: 'noopener' } : {})}>{inline(m[4], k)}</a>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  const isList = (l: string) => /^\s*([-*]|\d+\.)\s+/.test(l);
  const special = (l: string) => /^(#{2,4})\s/.test(l) || /^\|/.test(l) || isList(l) || /^>\s?/.test(l) || /^---+\s*$/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    const k = `b${i}`;
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      const text = inline(h[2], k);
      blocks.push(h[1].length === 2 ? <h2 key={k}>{text}</h2> : h[1].length === 3 ? <h3 key={k}>{text}</h3> : <h4 key={k}>{text}</h4>);
      i++; continue;
    }
    if (/^---+\s*$/.test(line)) { blocks.push(<hr key={k} />); i++; continue; }
    if (/^\|/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        const cells = lines[i++].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        if (!cells.every(c => /^:?-+:?$/.test(c))) rows.push(cells);
      }
      const [head, ...body] = rows;
      blocks.push(<div className="h-table" key={k}><table>
        <thead><tr>{head.map((c, j) => <th key={j}>{inline(c, `${k}h${j}`)}</th>)}</tr></thead>
        <tbody>{body.map((r, n) => <tr key={n}>{r.map((c, j) => <td key={j}>{inline(c, `${k}-${n}-${j}`)}</td>)}</tr>)}</tbody>
      </table></div>);
      continue;
    }
    if (/^>\s?/.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={k}><p>{inline(q.join(' '), k)}</p></blockquote>);
      continue;
    }
    if (isList(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && (isList(lines[i]) || (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length))) {
        if (isList(lines[i])) items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
        else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      const lis = items.map((t, j) => <li key={j}>{inline(t, `${k}-${j}`)}</li>);
      blocks.push(ordered ? <ol key={k}>{lis}</ol> : <ul key={k}>{lis}</ul>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !special(lines[i])) para.push(lines[i++].trim());
    blocks.push(<p key={k}>{inline(para.join(' '), k)}</p>);
  }
  return <Fragment>{blocks}</Fragment>;
}
