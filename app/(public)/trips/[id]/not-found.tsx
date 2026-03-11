import Link from "next/link";
import { MdErrorOutline } from "react-icons/md";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <MdErrorOutline className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Trip Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The booking you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/trips"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
          >
            View All Trips
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 transition-colors font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
