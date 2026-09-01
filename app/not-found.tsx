export default function NotFound() {
  return (
    <main className="friendly-error">
      <p className="eyebrow">404</p>
      <h1>This practice page does not exist.</h1>
      <p>Return to the exam catalog and choose an available exam.</p>
      <a className="primary-button" href="/">
        Open exam catalog
      </a>
    </main>
  );
}
