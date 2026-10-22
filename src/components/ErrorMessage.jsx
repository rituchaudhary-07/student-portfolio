function ErrorMessage({ message }) {
  return (
    <div className="error-message" role="alert">
      <p>Something went wrong: {message}</p>
    </div>
  )
}

export default ErrorMessage
