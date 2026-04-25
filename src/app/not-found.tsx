import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>404 - Not Found</h1>
      <Link href="/">Go back</Link>
    </>
  )
}