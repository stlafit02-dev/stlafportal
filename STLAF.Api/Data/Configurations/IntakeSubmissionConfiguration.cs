using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data.Configurations;

public class IntakeSubmissionConfiguration : IEntityTypeConfiguration<IntakeSubmission>
{
    public void Configure(EntityTypeBuilder<IntakeSubmission> builder)
    {
        builder.ToTable("intake_submissions");
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.TrackingNumber).HasColumnName("tracking_number").IsRequired();
        builder.Property(x => x.ClientType).HasColumnName("client_type").IsRequired();
        builder.Property(x => x.ClientName).HasColumnName("client_name").IsRequired();
        builder.Property(x => x.Industry).HasColumnName("industry");
        builder.Property(x => x.Address).HasColumnName("address").IsRequired();
        builder.Property(x => x.Country).HasColumnName("country");
        builder.Property(x => x.NumberOfEmployees).HasColumnName("number_of_employees");
        builder.Property(x => x.ContactPerson).HasColumnName("contact_person").IsRequired();
        builder.Property(x => x.Designation).HasColumnName("designation").IsRequired();
        builder.Property(x => x.ContactEmail).HasColumnName("contact_email");
        builder.Property(x => x.ContactPhone).HasColumnName("contact_phone");
        builder.Property(x => x.ConsultationPreference).HasColumnName("consultation_preference").IsRequired();
        builder.Property(x => x.ConsultationDate).HasColumnName("consultation_date");
        builder.Property(x => x.PreferredTimeSlots).HasColumnName("preferred_time_slots");
        builder.Property(x => x.ClientConcerns).HasColumnName("client_concerns");
        builder.Property(x => x.SupportingDocumentUrl).HasColumnName("supporting_document_url");
        builder.Property(x => x.SupportingDocumentFileName).HasColumnName("supporting_document_file_name");
        builder.Property(x => x.HowDidYouFindUs).HasColumnName("how_did_you_find_us").IsRequired();
        builder.Property(x => x.Status).HasColumnName("status");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.TrackingNumber).IsUnique();
    }
}