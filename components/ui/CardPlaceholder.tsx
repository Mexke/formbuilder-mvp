export const Card = (p)=> (<div {...p}>{p.children}</div>); export const CardContent = Card; export const CardHeader = Card; export const CardTitle = (p)=> (<h3 {...p}>{p.children}</h3>);
