using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data.Configurations;

public class DocumentRequestConfiguration : IEntityTypeConfiguration<DocumentRequest>
{
    public void Configure(EntityTypeBuilder<DocumentRequest> builder)
    {
        builder.ToTable("document_requests");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.TrackingNumber).HasColumnName("tracking_number").IsRequired();
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.Title).HasColumnName("title").IsRequired();
        builder.Property(x => x.Note).HasColumnName("note");
        builder.Property(x => x.DocumentLink).HasColumnName("document_link");
        builder.Property(x => x.FileObjectKey).HasColumnName("file_object_key");
        builder.Property(x => x.FileUrl).HasColumnName("file_url");
        builder.Property(x => x.FileName).HasColumnName("file_name");
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.EaDecidedByEmployeeId).HasColumnName("ea_decided_by_employee_id");
        builder.Property(x => x.EaDecisionNotes).HasColumnName("ea_decision_notes");
        builder.Property(x => x.EaDecidedAt).HasColumnName("ea_decided_at");
        builder.Property(x => x.PartnerDecidedByEmployeeId).HasColumnName("partner_decided_by_employee_id");
        builder.Property(x => x.PartnerDecisionNotes).HasColumnName("partner_decision_notes");
        builder.Property(x => x.PartnerDecidedAt).HasColumnName("partner_decided_at");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.TrackingNumber).IsUnique();
        builder.Property(x => x.DeadlineDate).HasColumnName("deadline_date");
    }
}