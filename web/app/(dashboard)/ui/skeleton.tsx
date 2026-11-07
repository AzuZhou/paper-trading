type Props = {
  className?: string;
};

export default function Skeleton({ className = "" }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-white/60 before:to-transparent motion-reduce:before:animate-none ${className}`}
    />
  );
}
