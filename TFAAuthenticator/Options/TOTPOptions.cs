using System.ComponentModel.DataAnnotations;

namespace TFAAuthenticator.Options;

public class TOTPOptions
{
    public const string TOTP = "TOTP";

    [Required]
    [MinLength(16)]
    public string Secret { get; set; }
}
