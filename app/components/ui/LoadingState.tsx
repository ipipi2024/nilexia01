interface LoadingStateProps {
  text?: string;
}

export default function LoadingState({ text = "Loading..." }: LoadingStateProps) {
  return (
    <div className="loading-page">
      <span className="spinner spinner--lg" />
      <span>{text}</span>
    </div>
  );
}
