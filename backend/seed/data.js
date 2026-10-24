// Edit this file to use your own names. Records are matched by citizenshipNumber.
// fatherCitizenshipNumber and motherCitizenshipNumber link a person to the records of their parents.
// Changes are applied the next time the backend restarts (a redeploy on Render).
// All data here is fictional demo data.

const accounts = {
  admin: { name: "Formy Admin", phone: "9800000001" },
  officer: { name: "Government Officer", phone: "9800000002" },
};

// Default passwords. Set ADMIN_PASSWORD and OFFICER_PASSWORD in Render to override.
const defaultPasswords = {
  admin: "Admin@123",
  officer: "Officer@123",
};

const citizens = [
  { fullName: "Ramesh Adhikari", phone: "9841000001", citizenshipNumber: "27-01-76-10000", issueDistrict: "Kathmandu", dob: "1972-01-01", fatherName: "Hari Adhikari", motherName: "Sita Adhikari", address: "Kathmandu-1", fatherCitizenshipNumber: "40-01-01-20001", motherCitizenshipNumber: "40-01-01-20002" },
  { fullName: "Sunita Gurung", phone: "9841000002", citizenshipNumber: "28-01-76-10037", issueDistrict: "Kaski", dob: "1975-02-08", fatherName: "Dil Gurung", motherName: "Maya Gurung", address: "Kaski-2", fatherCitizenshipNumber: "41-01-02-20003", motherCitizenshipNumber: "41-01-02-20004" },
  { fullName: "Anil Karki", phone: "9841000003", citizenshipNumber: "29-01-76-10074", issueDistrict: "Lalitpur", dob: "1978-03-15", fatherName: "Bishnu Karki", motherName: "Gita Karki", address: "Lalitpur-3", fatherCitizenshipNumber: "42-01-03-20005", motherCitizenshipNumber: "42-01-03-20006" },
  { fullName: "Prakash Thapa", phone: "9841000004", citizenshipNumber: "30-01-76-10111", issueDistrict: "Chitwan", dob: "1981-04-22", fatherName: "Narayan Thapa", motherName: "Kamala Thapa", address: "Chitwan-4", fatherCitizenshipNumber: "43-01-04-20007", motherCitizenshipNumber: "43-01-04-20008" },
  { fullName: "Sabina Rai", phone: "9841000005", citizenshipNumber: "31-01-76-10148", issueDistrict: "Jhapa", dob: "1984-05-02", fatherName: "Man Rai", motherName: "Tara Rai", address: "Jhapa-5", fatherCitizenshipNumber: "44-01-05-20009", motherCitizenshipNumber: "44-01-05-20010" },
  { fullName: "Bikash Tamang", phone: "9841000006", citizenshipNumber: "27-01-76-10185", issueDistrict: "Nuwakot", dob: "1987-06-09", fatherName: "Pasang Tamang", motherName: "Lakpa Tamang", address: "Nuwakot-6", fatherCitizenshipNumber: "45-01-06-20011", motherCitizenshipNumber: "45-01-06-20012" },
  { fullName: "Anjali Sharma", phone: "9841000007", citizenshipNumber: "28-01-76-10222", issueDistrict: "Bhaktapur", dob: "1990-07-16", fatherName: "Mohan Sharma", motherName: "Radha Sharma", address: "Bhaktapur-7", fatherCitizenshipNumber: "46-01-07-20013", motherCitizenshipNumber: "46-01-07-20014" },
  { fullName: "Suresh Poudel", phone: "9841000008", citizenshipNumber: "29-01-76-10259", issueDistrict: "Syangja", dob: "1993-08-23", fatherName: "Keshav Poudel", motherName: "Laxmi Poudel", address: "Syangja-8", fatherCitizenshipNumber: "47-01-01-20015", motherCitizenshipNumber: "47-01-01-20016" },
  { fullName: "Nisha Magar", phone: "9841000009", citizenshipNumber: "30-01-76-10296", issueDistrict: "Palpa", dob: "1996-09-03", fatherName: "Bir Magar", motherName: "Pabitra Magar", address: "Palpa-9", fatherCitizenshipNumber: "48-01-02-20017", motherCitizenshipNumber: "48-01-02-20018" },
  { fullName: "Dipak Basnet", phone: "9841000010", citizenshipNumber: "31-01-76-10333", issueDistrict: "Morang", dob: "1999-10-10", fatherName: "Ganesh Basnet", motherName: "Sarita Basnet", address: "Morang-1", fatherCitizenshipNumber: "49-01-03-20019", motherCitizenshipNumber: "49-01-03-20020" },
  { fullName: "Rina Shrestha", phone: "9841000011", citizenshipNumber: "27-01-76-10370", issueDistrict: "Kathmandu", dob: "1972-11-17", fatherName: "Krishna Shrestha", motherName: "Binita Shrestha", address: "Kathmandu-2" },
  { fullName: "Kiran Bhandari", phone: "9841000012", citizenshipNumber: "28-01-76-10407", issueDistrict: "Gorkha", dob: "1975-12-24", fatherName: "Ram Bhandari", motherName: "Devi Bhandari", address: "Gorkha-3" },
  { fullName: "Pooja Koirala", phone: "9841000013", citizenshipNumber: "29-01-76-10444", issueDistrict: "Sunsari", dob: "1978-01-04", fatherName: "Shyam Koirala", motherName: "Anita Koirala", address: "Sunsari-4" },
  { fullName: "Manoj Joshi", phone: "9841000014", citizenshipNumber: "30-01-76-10481", issueDistrict: "Dadeldhura", dob: "1981-02-11", fatherName: "Tek Joshi", motherName: "Parbati Joshi", address: "Dadeldhura-5" },
  { fullName: "Samikshya Dahal", phone: "9841000015", citizenshipNumber: "31-01-76-10518", issueDistrict: "Makwanpur", dob: "1984-03-18", fatherName: "Rajan Dahal", motherName: "Sushila Dahal", address: "Makwanpur-6" },
  { fullName: "Rajesh Khadka", phone: "9841000016", citizenshipNumber: "27-01-76-10555", issueDistrict: "Surkhet", dob: "1987-04-25", fatherName: "Dhan Khadka", motherName: "Bimala Khadka", address: "Surkhet-7" },
  { fullName: "Binita Subedi", phone: "9841000017", citizenshipNumber: "28-01-76-10592", issueDistrict: "Rupandehi", dob: "1990-05-05", fatherName: "Madhav Subedi", motherName: "Janaki Subedi", address: "Rupandehi-8" },
  { fullName: "Sandip Lama", phone: "9841000018", citizenshipNumber: "29-01-76-10629", issueDistrict: "Sindhupalchok", dob: "1993-06-12", fatherName: "Dorje Lama", motherName: "Pema Lama", address: "Sindhupalchok-9" },
  { fullName: "Kabita Pandey", phone: "9841000019", citizenshipNumber: "30-01-76-10666", issueDistrict: "Banke", dob: "1996-07-19", fatherName: "Gopal Pandey", motherName: "Mina Pandey", address: "Banke-1" },
  { fullName: "Nabin Neupane", phone: "9841000020", citizenshipNumber: "31-01-76-10703", issueDistrict: "Tanahun", dob: "1999-08-26", fatherName: "Bhim Neupane", motherName: "Kopila Neupane", address: "Tanahun-2" },
  { fullName: "Sarita Chaudhary", phone: "9841000021", citizenshipNumber: "27-01-76-10740", issueDistrict: "Dang", dob: "1972-09-06", fatherName: "Ram Chaudhary", motherName: "Phul Chaudhary", address: "Dang-3" },
  { fullName: "Roshan Oli", phone: "9841000022", citizenshipNumber: "28-01-76-10777", issueDistrict: "Kailali", dob: "1975-10-13", fatherName: "Prem Oli", motherName: "Durga Oli", address: "Kailali-4" },
  { fullName: "Alisha Bista", phone: "9841000023", citizenshipNumber: "29-01-76-10814", issueDistrict: "Baitadi", dob: "1978-11-20", fatherName: "Dev Bista", motherName: "Sabitri Bista", address: "Baitadi-5" },
  { fullName: "Umesh Regmi", phone: "9841000024", citizenshipNumber: "30-01-76-10851", issueDistrict: "Parbat", dob: "1981-12-27", fatherName: "Hem Regmi", motherName: "Indira Regmi", address: "Parbat-6" },
  { fullName: "Smriti Acharya", phone: "9841000025", citizenshipNumber: "31-01-76-10888", issueDistrict: "Dhading", dob: "1984-01-07", fatherName: "Yagya Acharya", motherName: "Bhagirathi Acharya", address: "Dhading-7" },
  { fullName: "Bibek Limbu", phone: "9841000026", citizenshipNumber: "27-01-76-10925", issueDistrict: "Taplejung", dob: "1987-02-14", fatherName: "Tilak Limbu", motherName: "Sunmaya Limbu", address: "Taplejung-8" },
  { fullName: "Priya Ghimire", phone: "9841000027", citizenshipNumber: "28-01-76-10962", issueDistrict: "Lamjung", dob: "1990-03-21", fatherName: "Bal Ghimire", motherName: "Rukmini Ghimire", address: "Lamjung-9" },
  { fullName: "Sagar Bhattarai", phone: "9841000028", citizenshipNumber: "29-01-76-10999", issueDistrict: "Kavrepalanchok", dob: "1993-04-01", fatherName: "Ishwor Bhattarai", motherName: "Gyanu Bhattarai", address: "Kavrepalanchok-1" },
  { fullName: "Sita Adhikari", phone: "9841000029", citizenshipNumber: "30-01-76-11036", issueDistrict: "Kanchanpur", dob: "1996-05-08", fatherName: "Jung Adhikari", motherName: "Sharada Adhikari", address: "Kanchanpur-2" },
  { fullName: "Aayush Pun", phone: "9841000030", citizenshipNumber: "31-01-76-11073", issueDistrict: "Myagdi", dob: "1999-06-15", fatherName: "Karna Pun", motherName: "Dhana Pun", address: "Myagdi-3" },
  // Parents of the first ten people above. Each child points to them with fatherCitizenshipNumber and motherCitizenshipNumber.
  { fullName: "Hari Adhikari", phone: "9851000001", citizenshipNumber: "40-01-01-20001", issueDistrict: "Kathmandu", dob: "1944-03-12", fatherName: "Shiva Adhikari", motherName: "Radha Adhikari", address: "Kathmandu-1" },
  { fullName: "Sita Adhikari", phone: "9851000002", citizenshipNumber: "40-01-01-20002", issueDistrict: "Kathmandu", dob: "1948-07-21", fatherName: "Bhim Dhakal", motherName: "Laxmi Dhakal", address: "Kathmandu-1" },
  { fullName: "Dil Gurung", phone: "9851000003", citizenshipNumber: "41-01-02-20003", issueDistrict: "Kaski", dob: "1946-05-09", fatherName: "Man Gurung", motherName: "Tulasa Gurung", address: "Kaski-2" },
  { fullName: "Maya Gurung", phone: "9851000004", citizenshipNumber: "41-01-02-20004", issueDistrict: "Kaski", dob: "1950-02-14", fatherName: "Prem Thapa", motherName: "Kali Thapa", address: "Kaski-2" },
  { fullName: "Bishnu Karki", phone: "9851000005", citizenshipNumber: "42-01-03-20005", issueDistrict: "Lalitpur", dob: "1949-08-30", fatherName: "Hira Karki", motherName: "Dhana Karki", address: "Lalitpur-3" },
  { fullName: "Gita Karki", phone: "9851000006", citizenshipNumber: "42-01-03-20006", issueDistrict: "Lalitpur", dob: "1953-11-05", fatherName: "Ratna Maharjan", motherName: "Sabitri Maharjan", address: "Lalitpur-3" },
  { fullName: "Narayan Thapa", phone: "9851000007", citizenshipNumber: "43-01-04-20007", issueDistrict: "Chitwan", dob: "1952-01-18", fatherName: "Bhakta Thapa", motherName: "Maili Thapa", address: "Chitwan-4" },
  { fullName: "Kamala Thapa", phone: "9851000008", citizenshipNumber: "43-01-04-20008", issueDistrict: "Chitwan", dob: "1956-09-02", fatherName: "Lal Pandey", motherName: "Sukmaya Pandey", address: "Chitwan-4" },
  { fullName: "Man Rai", phone: "9851000009", citizenshipNumber: "44-01-05-20009", issueDistrict: "Jhapa", dob: "1955-12-25", fatherName: "Dhan Rai", motherName: "Chandra Rai", address: "Jhapa-5" },
  { fullName: "Tara Rai", phone: "9851000010", citizenshipNumber: "44-01-05-20010", issueDistrict: "Jhapa", dob: "1959-06-11", fatherName: "Kul Limbu", motherName: "Maya Limbu", address: "Jhapa-5" },
  { fullName: "Pasang Tamang", phone: "9851000011", citizenshipNumber: "45-01-06-20011", issueDistrict: "Nuwakot", dob: "1958-04-07", fatherName: "Norbu Tamang", motherName: "Dolma Tamang", address: "Nuwakot-6" },
  { fullName: "Lakpa Tamang", phone: "9851000012", citizenshipNumber: "45-01-06-20012", issueDistrict: "Nuwakot", dob: "1962-10-19", fatherName: "Tenzing Lama", motherName: "Pema Lama", address: "Nuwakot-6" },
  { fullName: "Mohan Sharma", phone: "9851000013", citizenshipNumber: "46-01-07-20013", issueDistrict: "Bhaktapur", dob: "1960-02-23", fatherName: "Narad Sharma", motherName: "Kaushila Sharma", address: "Bhaktapur-7" },
  { fullName: "Radha Sharma", phone: "9851000014", citizenshipNumber: "46-01-07-20014", issueDistrict: "Bhaktapur", dob: "1964-08-16", fatherName: "Dev Sapkota", motherName: "Mina Sapkota", address: "Bhaktapur-7" },
  { fullName: "Keshav Poudel", phone: "9851000015", citizenshipNumber: "47-01-01-20015", issueDistrict: "Syangja", dob: "1963-07-04", fatherName: "Padam Poudel", motherName: "Kamala Poudel", address: "Syangja-8" },
  { fullName: "Laxmi Poudel", phone: "9851000016", citizenshipNumber: "47-01-01-20016", issueDistrict: "Syangja", dob: "1967-03-29", fatherName: "Hari Bhusal", motherName: "Gita Bhusal", address: "Syangja-8" },
  { fullName: "Bir Magar", phone: "9851000017", citizenshipNumber: "48-01-02-20017", issueDistrict: "Palpa", dob: "1966-09-13", fatherName: "Jit Magar", motherName: "Saraswati Magar", address: "Palpa-9" },
  { fullName: "Pabitra Magar", phone: "9851000018", citizenshipNumber: "48-01-02-20018", issueDistrict: "Palpa", dob: "1970-01-26", fatherName: "Dal Gharti", motherName: "Bhumi Gharti", address: "Palpa-9" },
  { fullName: "Ganesh Basnet", phone: "9851000019", citizenshipNumber: "49-01-03-20019", issueDistrict: "Morang", dob: "1968-06-08", fatherName: "Surya Basnet", motherName: "Nirmala Basnet", address: "Morang-1" },
  { fullName: "Sarita Basnet", phone: "9851000020", citizenshipNumber: "49-01-03-20020", issueDistrict: "Morang", dob: "1972-12-03", fatherName: "Khem Dahal", motherName: "Ambika Dahal", address: "Morang-1" },
];

const notices = [
  {
    title: "Welcome to Formy",
    body: "Apply for citizenship, passport and relationship verification services online. Create an account to get started.",
  },
  {
    title: "Keep your documents ready",
    body: "Have clear photos of your citizenship certificate and other required documents before you start an application.",
  },
];

module.exports = { accounts, defaultPasswords, citizens, notices };
