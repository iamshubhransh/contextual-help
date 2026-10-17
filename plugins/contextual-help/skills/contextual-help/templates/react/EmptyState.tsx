// EmptyState.tsx — an empty screen that teaches: what this place is for, one primary action,
// an optional shortcut into it (template, sample data, import), and a link to the concept.
import * as React from 'react';

type Action = { label: string; onClick: () => void };

type Props =
  | { kind: 'first-use'; title: string; body: string; primary: Action; secondary?: Action; preview?: React.ReactNode; docs?: React.ReactNode }
  | { kind: 'no-results'; query: string; filters?: string[]; onClearFilters?: () => void; create?: Action }
  | { kind: 'done'; title: string; body?: string; next?: Action }
  | { kind: 'no-access'; title: string; body: string; request?: Action };

export function EmptyState(props: Props) {
  if (props.kind === 'no-results') {
    const { query, filters = [], onClearFilters, create } = props;
    return (
      <div className="empty" role="status">
        <h2 className="empty-title">No results for “{query}”{filters.length ? ` with ${filters.join(', ')}` : ''}</h2>
        <p className="empty-body">Check the spelling, or try fewer words{filters.length ? ' or fewer filters' : ''}.</p>
        <div className="empty-actions">
          {filters.length > 0 && onClearFilters && <button className="btn" onClick={onClearFilters}>Clear filters</button>}
          {create && <button className="btn btn-link" onClick={create.onClick}>{create.label}</button>}
        </div>
      </div>
    );
  }
  if (props.kind === 'done') {
    return (
      <div className="empty">
        <h2 className="empty-title">{props.title}</h2>
        {props.body && <p className="empty-body">{props.body}</p>}
        {props.next && <div className="empty-actions"><button className="btn btn-link" onClick={props.next.onClick}>{props.next.label}</button></div>}
      </div>
    );
  }
  if (props.kind === 'no-access') {
    return (
      <div className="empty">
        <h2 className="empty-title">{props.title}</h2>
        <p className="empty-body">{props.body}</p>
        {props.request && <div className="empty-actions"><button className="btn btn-primary" onClick={props.request.onClick}>{props.request.label}</button></div>}
      </div>
    );
  }
  const { title, body, primary, secondary, preview, docs } = props;
  return (
    <div className="empty">
      {preview && <div className="empty-preview" aria-hidden="true">{preview}</div>}
      <h2 className="empty-title">{title}</h2>
      <p className="empty-body">{body}</p>
      <div className="empty-actions">
        <button className="btn btn-primary" onClick={primary.onClick}>{primary.label}</button>
        {secondary && <button className="btn btn-link" onClick={secondary.onClick}>{secondary.label}</button>}
      </div>
      {docs && <p className="empty-docs">{docs}</p>}
    </div>
  );
}
