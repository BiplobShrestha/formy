// The three services Formy supports. Each service is plain data: its fields, which are
// required, and the wording used in the generated letters.
//
// To add a new service later, add one more object to the `services` array.
//
// Field options:
//   name      key used in the saved application data
//   label     text shown to the user
//   type      text | textarea | number | date | phone | select | file
//   options   list of choices (select only)
//   required  defaults to true. Set false for optional fields
//   showIf    { field, equals } show (and require) this field only when another field has that value
//   min, max  number range (number only)
//   minAge    minimum age in years (date only)
//   section   starts a new heading in the form

const common = [
  { name: "fullName", label: "Full name", type: "text", section: "Personal details" },
  { name: "dob", label: "Date of birth", type: "date" },
  { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  { name: "phone", label: "Phone number", type: "phone" },
  { name: "district", label: "District", type: "text", section: "Permanent address" },
  { name: "municipality", label: "Municipality / Rural municipality", type: "text" },
  { name: "ward", label: "Ward number", type: "number", min: 1, max: 35 },
  { name: "fatherName", label: "Father's name", type: "text", section: "Family" },
  { name: "motherName", label: "Mother's name", type: "text" },
  {
    name: "photo",
    label: "Passport size photo",
    type: "file",
    section: "Photo",
  },
];

const services = [
  {
    key: "citizenship",
    title: "Citizenship Certificate by Descent",
    description: "Apply for a Nepali citizenship certificate by descent through your parents.",
    maxFileKB: 1024,
    requestText: "issue me a Nepali citizenship certificate by descent",
    fields: [
      ...common.slice(0, 2).map((f) => (f.name === "dob" ? { ...f, minAge: 16 } : f)),
      ...common.slice(2),
      {
        name: "specialCase",
        label: "Does either of these apply to you?",
        type: "select",
        options: ["None", "Married woman", "Migrated from another district"],
        section: "Your situation",
      },
      { name: "fatherCitizenshipDoc", label: "Father's citizenship certificate", type: "file", section: "Documents" },
      { name: "motherCitizenshipDoc", label: "Mother's citizenship certificate", type: "file" },
      {
        name: "birthProofDoc",
        label: "Proof of date of birth",
        type: "file",
      },
      {
        name: "wardApplicationDoc",
        label: "Application form certified by the ward chairperson",
        type: "file",
      },
      {
        name: "marriageCertificateDoc",
        label: "Marriage registration certificate",
        type: "file",
        showIf: { field: "specialCase", equals: "Married woman" },
      },
      {
        name: "husbandCitizenshipDoc",
        label: "Husband's citizenship certificate",
        type: "file",
        showIf: { field: "specialCase", equals: "Married woman" },
      },
      {
        name: "maitiRelativeCitizenshipDoc",
        label: "Citizenship certificate of your father, mother or brother",
        type: "file",
        showIf: { field: "specialCase", equals: "Married woman" },
      },
      {
        name: "migrationCertificateDoc",
        label: "Migration certificate (Wasaai Saraai)",
        type: "file",
        showIf: { field: "specialCase", equals: "Migrated from another district" },
      },
      {
        name: "landOrHouseProofDoc",
        label: "Land ownership, house completion certificate or tax receipt",
        type: "file",
        showIf: { field: "specialCase", equals: "Migrated from another district" },
      },
    ],
  },

  {
    key: "passport",
    title: "Passport (e-Passport) Application",
    description: "Apply for a new e-passport, renew an existing one, or replace a lost one.",
    maxFileKB: 300,
    requestText: "process my application for a {applicationType} e-passport",
    fields: [
      ...common,
      { name: "applicationType", label: "Application type", type: "select", options: ["New", "Renewal", "Lost"], section: "Passport details" },
      { name: "citizenshipNumber", label: "Citizenship number", type: "text" },
      { name: "citizenshipIssueDistrict", label: "Citizenship issue district", type: "text" },
      {
        name: "previousPassportNumber",
        label: "Previous passport number",
        type: "text",
        showIf: { field: "applicationType", equals: "Renewal" },
      },
      {
        name: "dropHusbandSurname",
        label: "Do you want to remove your husband's surname after divorce?",
        type: "select",
        options: ["No", "Yes"],
      },
      { name: "citizenshipFrontDoc", label: "Citizenship certificate (front)", type: "file", section: "Documents" },
      { name: "citizenshipBackDoc", label: "Citizenship certificate (back)", type: "file" },
      {
        name: "oldPassportDoc",
        label: "Old passport",
        type: "file",
        showIf: { field: "applicationType", equals: "Renewal" },
      },
      {
        name: "divorceCertificateDoc",
        label: "Divorce certificate",
        type: "file",
        showIf: { field: "dropHusbandSurname", equals: "Yes" },
      },
    ],
  },

  {
    key: "relationship",
    title: "Relationship Verification (Nata Pramanit)",
    description: "Get a certificate that confirms your relationship with a family member.",
    maxFileKB: 1024,
    requestText:
      "issue a relationship verification certificate (Nata Pramanit) confirming my relationship with {relativeName} ({relationType}), for the purpose of {purpose}",
    fields: [
      ...common,
      { name: "relativeName", label: "Relative's full name", type: "text", section: "Relationship details" },
      {
        name: "relationType",
        label: "Relation to you",
        type: "select",
        options: ["Father", "Mother", "Grandfather", "Grandmother", "Brother", "Sister", "Uncle", "Aunt", "Other"],
      },
      { name: "relativeCitizenshipNumber", label: "Relative's citizenship number", type: "text" },
      {
        name: "purpose",
        label: "Purpose",
        type: "select",
        options: ["Citizenship by descent", "Passport", "Land or property", "Inheritance", "Other"],
      },
      { name: "relativeDeceased", label: "Is the relative deceased?", type: "select", options: ["No", "Yes"] },
      { name: "witnessName", label: "Witness full name", type: "text", section: "Witness" },
      { name: "witnessPhone", label: "Witness phone number", type: "phone" },
      { name: "applicantCitizenshipDoc", label: "Your citizenship certificate", type: "file", section: "Documents" },
      { name: "relativeCitizenshipDoc", label: "Relative's citizenship certificate", type: "file" },
      { name: "birthCertificateDoc", label: "Birth certificate", type: "file" },
      { name: "familyCardDoc", label: "Family population card", type: "file" },
      {
        name: "deathCertificateDoc",
        label: "Death certificate of the relative",
        type: "file",
        showIf: { field: "relativeDeceased", equals: "Yes" },
      },
    ],
  },
];

function getService(key) {
  return services.find((s) => s.key === key) || null;
}

module.exports = { services, getService };
