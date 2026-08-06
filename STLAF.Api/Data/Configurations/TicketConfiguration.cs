using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Departments.IT.Entities;

namespace STLAF.Api.Data.Configurations.IT;

public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        builder.ToTable("it_tickets");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.TicketNumber).HasColumnName("ticket_number").IsRequired();
        builder.Property(x => x.Name).HasColumnName("name").IsRequired();
        builder.Property(x => x.CompanyEmail).HasColumnName("company_email").IsRequired();
        builder.Property(x => x.ViberNumber).HasColumnName("viber_number");
        builder.Property(x => x.Description).HasColumnName("description").IsRequired();
        builder.Property(x => x.Category).HasColumnName("category");
        builder.Property(x => x.Priority).HasColumnName("priority");
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.Department).HasColumnName("department");
        builder.Property(x => x.AssignedTo).HasColumnName("assigned_to");
        builder.Property(x => x.SubmittedByEmployeeId).HasColumnName("submitted_by_employee_id");
        builder.Property(x => x.DateSubmitted).HasColumnName("date_submitted");
        builder.Property(x => x.UpdatedDate).HasColumnName("updated_date");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.TicketNumber).IsUnique();
    }
}