using FluentValidation;
using FluentValidation.Results;
using System.Text.RegularExpressions;

namespace TFAAuthenticator.Contracts;

public class AuthRequest
{
    public required string Code { get; set; }
}

public partial class AuthRequestValidator : AbstractValidator<AuthRequest>
{
    public AuthRequestValidator()
    {
        RuleFor(x => x)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .ChildRules(validator =>
            {
                validator.RuleFor(x => x.Code)
                .NotEmpty()
                .Length(6)
                .Custom((a, b) =>
                {
                    var pattern = NonDigitsPattern();

                    if (pattern.IsMatch(a))
                    {
                        b.AddFailure(new ValidationFailure
                        {
                            ErrorMessage = "Code must contain only digits"
                        });
                    }
                });
            });
    }

    [GeneratedRegex("\\D")]
    private static partial Regex NonDigitsPattern();
}