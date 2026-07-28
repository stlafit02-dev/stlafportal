using STLAF.Api.Common.Entities;

namespace STLAF.Api.Identity.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public ICollection<User> Users { get; set; } = new List<User>();
}