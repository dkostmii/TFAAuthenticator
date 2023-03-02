namespace TFAAuthenticator.Exceptions;

public class NeverException : Exception
{
    public NeverException() : base("This exception must never occur")
    { }
}
