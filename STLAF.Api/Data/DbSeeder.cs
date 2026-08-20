using Microsoft.EntityFrameworkCore;
using STLAF.Api.Identity.Entities;
using STLAF.Api.Departments.HRAdmin.Entities;
using STLAF.Api.Common.Entities;

namespace STLAF.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Stage 1: Departments
        if (!await db.Departments.AnyAsync())
        {
            db.Departments.AddRange(
                new Department { Name = "IT" },
                new Department { Name = "HRAdmin" },
                new Department { Name = "Litigation" },
                new Department { Name = "Accounting" },
                new Department { Name = "Corporate" },
                new Department { Name = "Marketing" },
                new Department { Name = "Partner" }
            );
            await db.SaveChangesAsync();
        }

        // Stage 2: Roles
        if (!await db.Roles.AnyAsync())
        {
            db.Roles.AddRange(
                new Role { Name = "SuperAdmin" },
                new Role { Name = "DeptAdmin" },
                new Role { Name = "Employee" }
            );
            await db.SaveChangesAsync();
        }

        // Stage 3: Test users (depends on Departments + Roles already existing in DB)
        if (!await db.Users.AnyAsync())
        {
            var departments = await db.Departments.ToListAsync();
            var deptAdminRole = await db.Roles.FirstAsync(r => r.Name == "DeptAdmin");

            foreach (var dept in departments)
            {
                db.Users.Add(new User
                {
                    Email = $"{dept.Name.ToLower()}@stlaf.global",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    FullName = $"{dept.Name} Test User",
                    DepartmentId = dept.Id,
                    RoleId = deptAdminRole.Id,
                    IsActive = true
                });
            }

            await db.SaveChangesAsync();
        }
        if (!await db.EmployeeCategories.AnyAsync())
        {
            db.EmployeeCategories.AddRange(
                new EmployeeCategory { Name = "STLAF", Code = 1 },
                new EmployeeCategory { Name = "CCT", Code = 2 }
            );
            await db.SaveChangesAsync();
        }
        if (!await db.LeaveTypes.AnyAsync())
        {
            db.LeaveTypes.AddRange(
                new LeaveType { Name = "Vacation Leave", DefaultCredits = 15 },
                new LeaveType { Name = "Sick Leave", DefaultCredits = 15 },
                new LeaveType { Name = "Emergency Leave", DefaultCredits = 5 }
            );
            await db.SaveChangesAsync();
        }
        if (!await db.IntakeGroups.AnyAsync())
        {
            var groups = new (string Category, string Name, string Emails, string[] Services)[]
            {
        ("Accounting, Audit and Tax Services", "Financial Advisory",
            "veteodosio@sadsadtamesislaw.com,aeorbido@sadsadtamesislaw.com,easabusap@sadsadtamesislaw.com",
            new[] {
                "End-to-end transaction advisory, from structuring through deal completion",
                "Mergers and acquisitions (M&A) advisory",
                "Capital raising advisory",
                "Business valuation services",
                "Financial and legal due diligence",
                "Regulatory Approval Assistance",
                "Transaction documentation support",
                "Advisory support for financially distressed and restructuring companies",
                "Financial and corporate restructuring strategy",
                "Corporate Restructuring Advisory",
                "Court-Supervised Rehabilitation Advisory",
                "Rehabilitation Plan Preparation",
                "Legal Petition and Rehabilitation Support"
            }),
        ("Accounting, Audit and Tax Services", "Outsourced Accounting and Bookkeeping",
            "veteodosio@sadsadtamesislaw.com,aeorbido@sadsadtamesislaw.com,msbasto@sadsadtamesislaw.com",
            new[] {
                "BIR-Compliant Bookkeeping Services",
                "Manual and Computerized Books of Accounts",
                "BIR Statutory Reporting and Annual Filings",
                "SEC Statutory Reporting and Compliance Services",
                "Initial Setup and Registration of Books of Accounts",
                "First-Year Statutory Filings",
                "Accounting and Compliance Support for Foreign-Owned Philippine Entities"
            }),
        ("Accounting, Audit and Tax Services", "Audit and Assurance Services",
            "rrdelacruz@sadsadtamesislaw.com,alaguinaldo@sadsadtamesislaw.com,jtnaza@sadsadtamesislaw.com",
            new[] {
                "External Audit of Financial Statements",
                "Preparation of Audited Financial Statements (AFS)",
                "Internal and Operational Audit Services",
                "Risk-Based Internal Audit",
                "ESG Assurance Engagements",
                "PFRS S1 and S2 Compliance Support",
                "Independent Verification of PLC Sustainability Reports",
                "Regulatory Response Assistance",
                "Legal Coordination for Audit-Related Matter"
            }),
        ("Accounting, Audit and Tax Services", "Tax Advisory and Strategic Planning",
            "rrdelacruz@sadsadtamesislaw.com,alaguinaldo@sadsadtamesislaw.com,raquitiquit@sadsadtamesislaw.com",
            new[] {
                "Corporate tax planning and structuring, including cross-border, foreign ownership, and estate/succession matters",
                "Tax compliance and reporting, return filing, books of accounts, and compliance calendar management",
                "Tax risk assessments, audit readiness reviews, and BIR audit/examination support",
                "Assistance through all stages of BIR assessment and dispute resolution, from Letter of Authority (LOA) to litigation",
                "VAT and indirect tax compliance, advisory, and refund claims",
                "Transfer pricing documentation, studies, and related-party compliance and audit support"
            }),
        ("Accounting, Audit and Tax Services", "Risk Management and Internal Controls",
            "rrdelacruz@sadsadtamesislaw.com,alaguinaldo@sadsadtamesislaw.com,jbregis@sadsadtamesislaw.com",
            new[] {
                "Enterprise risk management and internal controls advisory",
                "Framework implementation (COSO, ISO 31000) and board/audit committee reporting",
                "Regulatory risk and governance compliance advisory (BSP, SEC, ICOR)",
                "Forensic accounting and fraud investigation (asset misappropriation, financial statement fraud, misconduct)",
                "Legal assessment of related criminal and civil remedies"
            }),
        ("Accounting, Audit and Tax Services", "Business Advisory and Consulting",
            "veteodosio@sadsadtamesislaw.com,aeorbido@sadsadtamesislaw.com,kdgodinez@sadsadtamesislaw.com",
            new[] {
                "Strategy, operations, and business process improvement advisory",
                "Process mapping, workflow redesign, and operational model design",
                "Digital transformation and ERP advisory, from selection through implementation",
                "System integration, data migration, and e-invoicing compliance advisory",
                "ESG and sustainability advisory, including readiness assessments and disclosure preparation",
                "Human capital and organizational design consulting",
                "Business continuity, resilience, and crisis management advisory"
            }),

        ("Corporate Services", "Corporate Registration",
            "kdmendoza@sadsadtamesislaw.com",
            new[] {
                "Incorporation", "Business Closure", "Trademark Registration", "Copyright Registration",
                "Patent Registration", "AMLC Registration", "AMLA Compliance Officer Provision",
                "Bangko Sentral ng Pilipinas Registration", "Data Privacy Protection Registration",
                "Data Privacy Officer Provision"
            }),
        ("Corporate Services", "Corporate Housekeeping",
            "jtarellano@sadsadtamesislaw.com",
            new[] {
                "Amendment of General Information Sheet (GIS)", "Amendment of Articles of Incorporation",
                "Amendment of By-Laws", "Filing and submission of Financial Statements (FS)",
                "Renewal of Business Permit"
            }),
        ("Corporate Services", "Property and Acquisition",
            "mcvibal@sadsadtamesislaw.com",
            new[] {
                "Transfer of Real Property via sale or donation", "Transfer of Shares via sale or donation",
                "Extrajudicial Settlement of Intestate Estate", "Subdivision/Partition of Property",
                "Consolidation of Title", "Will and Testament and/or Will and Probate",
                "DHSUD Project Registration and Compliance", "DAR land use and conversion",
                "Acquisition of Permits and LGU clearances", "Reclassification of Land",
                "Residential Free Patent Application", "Cancellation of the Annotation of the Mortgage",
                "Due Diligence", "Estate Planning"
            }),
        ("Corporate Services", "Taxation",
            "lycapua@sadsadtamesislaw.com",
            new[] {
                "Tax Treaty Relief Application (TTRA)", "Application for VAT Refund",
                "Letter of Authority (LOA)", "Preliminary Assessment Notice (PAN)",
                "Final Decision on Disputed Assessment (FDDA)"
            }),
        ("Corporate Services", "Labor Relations",
            "kdmendoza@sadsadtamesislaw.com",
            new[] { "Retrenchment/ Termination", "Single Entry Approach (SENA)" }),
        ("Corporate Services", "Cross-Border Services",
            "cfsantiago@sadsadtamesislaw.com,scelias@sadsadtamesislaw.com",
            new[] {
                "Intellectual Property Registration", "ESG & Sustainability Reporting",
                "Corporate Mobility Assistance", "Merger and Acquisitions", "Anti-Trust and Competition Laws"
            }),

        ("Litigation Services", "Criminal Litigation",
            "rmbordeos@sadsadtamesislaw.com",
            new[] { "General Criminal Prosecution", "General Criminal Defense" }),
        ("Litigation Services", "Civil Litigation",
            "cvdiaz@sadsadtamesislaw.com",
            new[] {
                "Ejectment Cases", "Breach of Contract", "Recovery of Damages",
                "Reissuance of Title", "Reconstitution of Title"
            }),
        ("Litigation Services", "Labor Litigation",
            "gubanzuela@sadsadtamesislaw.com",
            Array.Empty<string>()),
        ("Litigation Services", "Administrative Litigation",
            "rmbordeos@sadsadtamesislaw.com",
            Array.Empty<string>()),
        ("Litigation Services", "Tax Litigation",
            "gdadora@sadsadtamesislaw.com",
            Array.Empty<string>()),
        ("Litigation Services", "Cybercrime and Technology Related Litigation",
            "cavdiaz@sadsadtamesislaw.com",
            new[] { "Data Privacy", "Cybercrime and other Cyber offenses", "Intellectual Property" }),
        ("Litigation Services", "Alternative Dispute Resolution",
            "gdadora@sadsadtamesislaw.com",
            Array.Empty<string>()),
        ("Litigation Services", "Family Law",
            "kcsadsad@sadsadtamesislaw.com",
            new[] {
                "Recognition of Foreign Divorce", "Adoption", "Nullity of Marriage",
                "Annulment of Marriage", "Legal Separation"
            }),
            };

            var sortOrder = 0;
            foreach (var (category, name, emails, services) in groups)
            {
                var group = new IntakeGroup
                {
                    Category = category,
                    Name = name,
                    RecipientEmails = emails,
                    SortOrder = sortOrder++
                };
                db.IntakeGroups.Add(group);
                await db.SaveChangesAsync();

                foreach (var serviceName in services)
                {
                    db.IntakeServices.Add(new IntakeService { GroupId = group.Id, Name = serviceName });
                }
                await db.SaveChangesAsync();
            }
        }
    }
}