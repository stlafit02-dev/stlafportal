namespace STLAF.Api.Common;

public static class ModuleCatalog
{
    public static readonly (string Key, string Label)[] Modules =
    {
        ("hr-employees", "HR: Employees"),
        ("hr-leave-settings", "HR: Leave Settings"),
        ("hr-medical-certificates", "HR: Medical Certificates"),
        ("hr-reports", "HR: Reports"),
        ("it-ticketing", "IT: Ticketing"),
        ("it-assets", "IT: Asset Management"),
        ("it-gmail", "IT: Gmail Management"),
        ("document-ea-review", "Documents: EA Review"),
        ("document-partner-review", "Documents: Partner Review"),
        ("intern-accounts", "IT: Intern Account Management"),
        ("tickets-submit", "Common: Submit Ticket"),
        ("leave-overtime", "Common: Leave & Overtime"),
        ("documents-submit", "Common: Submit Document"),
    };

    public static IEnumerable<string> Keys => Modules.Select(m => m.Key);

    public static bool IsValid(string key) => Modules.Any(m => m.Key == key);
}
