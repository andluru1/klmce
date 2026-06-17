var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
var PrismaClient = require('@prisma/client').PrismaClient;
var bcrypt = require('bcryptjs');
var prisma = new PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var passwordHash, deptCSE, deptECE, deptMECH, cseA, cseB, eceA, admin, faculty1, faculty2, faculty3, subjMath1, subjPhy, subjC, subjDS, subjDB, subjOS, subjAI, subjML, subjSS, r101, r102, rLab1, firstNames, lastNames, students, rollIdx, _i, firstNames_1, fName, _a, lastNames_1, lName, isCSE, sectionId, deptId, code, rollNum, isDemoUser, student, demoUser, _b, students_1, s, isDemo, createExamSuite, mathExams, phyExams, cExams, dsExams, dbExams, _loop_1, _c, students_2, s, days, createdSchedules, _d, days_1, day, sch1, sch2;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log("Injecting Hyper-Realistic Enterprise Data...");
                    // Clean Database
                    return [4 /*yield*/, prisma.transaction.deleteMany()];
                case 1:
                    // Clean Database
                    _e.sent();
                    return [4 /*yield*/, prisma.studentResult.deleteMany()];
                case 2:
                    _e.sent();
                    return [4 /*yield*/, prisma.exam.deleteMany()];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, prisma.attendanceRecord.deleteMany()];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, prisma.disciplinaryRecord.deleteMany()];
                case 5:
                    _e.sent();
                    return [4 /*yield*/, prisma.auditLog.deleteMany()];
                case 6:
                    _e.sent();
                    return [4 /*yield*/, prisma.notification.deleteMany()];
                case 7:
                    _e.sent();
                    return [4 /*yield*/, prisma.leaveRequest.deleteMany()];
                case 8:
                    _e.sent();
                    return [4 /*yield*/, prisma.schedule.deleteMany()];
                case 9:
                    _e.sent();
                    return [4 /*yield*/, prisma.announcement.deleteMany()];
                case 10:
                    _e.sent();
                    return [4 /*yield*/, prisma.fee.deleteMany()];
                case 11:
                    _e.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 12:
                    _e.sent();
                    return [4 /*yield*/, prisma.classSection.deleteMany()];
                case 13:
                    _e.sent();
                    return [4 /*yield*/, prisma.subject.deleteMany()];
                case 14:
                    _e.sent();
                    return [4 /*yield*/, prisma.room.deleteMany()];
                case 15:
                    _e.sent();
                    return [4 /*yield*/, prisma.department.deleteMany()];
                case 16:
                    _e.sent();
                    return [4 /*yield*/, bcrypt.hash('password123', 10)];
                case 17:
                    passwordHash = _e.sent();
                    return [4 /*yield*/, prisma.department.create({ data: { name: 'Computer Science & Engineering', code: '05' } })];
                case 18:
                    deptCSE = _e.sent();
                    return [4 /*yield*/, prisma.department.create({ data: { name: 'Electronics & Communication', code: '04' } })];
                case 19:
                    deptECE = _e.sent();
                    return [4 /*yield*/, prisma.department.create({ data: { name: 'Mechanical Engineering', code: '03' } })];
                case 20:
                    deptMECH = _e.sent();
                    return [4 /*yield*/, prisma.classSection.create({ data: { name: 'CSE-A-III', semester: 'III-I', departmentId: deptCSE.id } })];
                case 21:
                    cseA = _e.sent();
                    return [4 /*yield*/, prisma.classSection.create({ data: { name: 'CSE-B-III', semester: 'III-I', departmentId: deptCSE.id } })];
                case 22:
                    cseB = _e.sent();
                    return [4 /*yield*/, prisma.classSection.create({ data: { name: 'ECE-A-II', semester: 'II-II', departmentId: deptECE.id } })];
                case 23:
                    eceA = _e.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: { rollNumber: 'ADMIN-01', passwordHash: passwordHash, role: 'ADMIN', name: 'Dr. V.S.S. Murthy', phone: '9848012345' }
                        })];
                case 24:
                    admin = _e.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: { rollNumber: 'FAC-CSE-01', passwordHash: passwordHash, role: 'FACULTY', name: 'Dr. V. Lokeswara Reddy', phone: '9876543210', departmentId: deptCSE.id }
                        })];
                case 25:
                    faculty1 = _e.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: { rollNumber: 'FAC-CSE-02', passwordHash: passwordHash, role: 'FACULTY', name: 'Prof. M.V. Narayana', phone: '9876543211', departmentId: deptCSE.id }
                        })];
                case 26:
                    faculty2 = _e.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: { rollNumber: 'FAC-ECE-01', passwordHash: passwordHash, role: 'FACULTY', name: 'Dr. G. Hemalatha', phone: '9876543212', departmentId: deptECE.id }
                        })];
                case 27:
                    faculty3 = _e.sent();
                    return [4 /*yield*/, prisma.subject.create({ data: { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, semester: 'I-I', departmentId: deptCSE.id } })];
                case 28:
                    subjMath1 = _e.sent();
                    return [4 /*yield*/, prisma.subject.create({ data: { code: 'PH101', name: 'Engineering Physics', credits: 3, semester: 'I-I', departmentId: deptCSE.id } })];
                case 29:
                    subjPhy = _e.sent();
                    return [4 /*yield*/, prisma.subject.create({ data: { code: 'CS201', name: 'Programming in C', credits: 4, semester: 'II-I', departmentId: deptCSE.id } })];
                case 30:
                    subjC = _e.sent();
                    return [4 /*yield*/, prisma.subject.create({ data: { code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, semester: 'III-I', departmentId: deptCSE.id } })];
                case 31:
                    subjDS = _e.sent();
                    return [4 /*yield*/, prisma.subject.create({ data: { code: 'CS302', name: 'Database Management Systems', credits: 3, semester: 'III-I', departmentId: deptCSE.id } })];
                case 32:
                    subjDB = _e.sent();
                    return [4 /*yield*/, prisma.subject.create({ data: { code: 'CS303', name: 'Operating Systems', credits: 4, semester: 'III-I', departmentId: deptCSE.id } })];
                case 33:
                    subjOS = _e.sent();
                    return [4 /*yield*/, prisma.subject.create({ data: { code: 'CS401', name: 'Artificial Intelligence', credits: 4, semester: 'IV-I', departmentId: deptCSE.id } })];
                case 34:
                    subjAI = _e.sent();
                    return [4 /*yield*/, prisma.subject.create({ data: { code: 'CS402', name: 'Machine Learning', credits: 4, semester: 'IV-I', departmentId: deptCSE.id } })];
                case 35:
                    subjML = _e.sent();
                    return [4 /*yield*/, prisma.subject.create({ data: { code: 'EC201', name: 'Signals and Systems', credits: 4, semester: 'II-II', departmentId: deptECE.id } })];
                case 36:
                    subjSS = _e.sent();
                    return [4 /*yield*/, prisma.room.create({ data: { number: '101', capacity: 60, type: 'Classroom' } })];
                case 37:
                    r101 = _e.sent();
                    return [4 /*yield*/, prisma.room.create({ data: { number: '102', capacity: 60, type: 'Classroom' } })];
                case 38:
                    r102 = _e.sent();
                    return [4 /*yield*/, prisma.room.create({ data: { number: 'Lab-1', capacity: 30, type: 'Lab' } })];
                case 39:
                    rLab1 = _e.sent();
                    firstNames = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Karthik', 'Ananya', 'Vikram', 'Divya', 'Sanjay', 'Neha'];
                    lastNames = ['Reddy', 'Sharma', 'Patel', 'Rao', 'Kumar', 'Singh', 'Deshmukh', 'Iyer', 'Nair', 'Menon'];
                    students = [];
                    rollIdx = 1;
                    _i = 0, firstNames_1 = firstNames;
                    _e.label = 40;
                case 40:
                    if (!(_i < firstNames_1.length)) return [3 /*break*/, 45];
                    fName = firstNames_1[_i];
                    _a = 0, lastNames_1 = lastNames;
                    _e.label = 41;
                case 41:
                    if (!(_a < lastNames_1.length)) return [3 /*break*/, 44];
                    lName = lastNames_1[_a];
                    if (rollIdx > 30)
                        return [3 /*break*/, 44]; // Limit to 30 students
                    isCSE = rollIdx <= 20;
                    sectionId = isCSE ? (rollIdx <= 10 ? cseA.id : cseB.id) : eceA.id;
                    deptId = isCSE ? deptCSE.id : deptECE.id;
                    code = rollIdx.toString().padStart(2, '0');
                    rollNum = "209Y1A".concat(isCSE ? '05' : '04').concat(code);
                    isDemoUser = rollNum === '209Y1A0501';
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                rollNumber: rollNum,
                                passwordHash: passwordHash,
                                role: 'STUDENT',
                                name: "".concat(fName, " ").concat(lName),
                                phone: "9".concat(Math.floor(Math.random() * 900000000 + 100000000)),
                                departmentId: deptId,
                                classSectionId: sectionId,
                                currentSem: isCSE ? 'III-I' : 'II-II',
                                // Force demo user to have exactly 68.5 attendance to trigger warnings
                                attendancePct: isDemoUser ? 68.5 : Math.floor(Math.random() * 30 + 65),
                                rfidTag: "RFID-".concat(rollNum)
                            }
                        })];
                case 42:
                    student = _e.sent();
                    students.push(student);
                    rollIdx++;
                    _e.label = 43;
                case 43:
                    _a++;
                    return [3 /*break*/, 41];
                case 44:
                    _i++;
                    return [3 /*break*/, 40];
                case 45:
                    demoUser = students[0];
                    _b = 0, students_1 = students;
                    _e.label = 46;
                case 46:
                    if (!(_b < students_1.length)) return [3 /*break*/, 51];
                    s = students_1[_b];
                    isDemo = s.id === demoUser.id;
                    // Everyone has tuition fee
                    return [4 /*yield*/, prisma.fee.create({
                            data: {
                                feeType: 'Tuition Fee 2024-25',
                                amount: 45000,
                                isPaid: isDemo ? false : Math.random() > 0.4,
                                paidDate: null,
                                paymentMode: null,
                                paymentRef: null,
                                dueDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Overdue
                                userId: s.id,
                                remarks: 'Mandatory semester fee'
                            }
                        })];
                case 47:
                    // Everyone has tuition fee
                    _e.sent();
                    if (!isDemo) return [3 /*break*/, 50];
                    // Add extreme financial holds to demo user
                    return [4 /*yield*/, prisma.fee.create({
                            data: {
                                feeType: 'Late Fee Penalty',
                                amount: 2500,
                                isPaid: false,
                                dueDate: new Date(),
                                userId: s.id,
                                remarks: 'Penalty applied due to overdue tuition fee. Contact Accounts immediately.'
                            }
                        })];
                case 48:
                    // Add extreme financial holds to demo user
                    _e.sent();
                    return [4 /*yield*/, prisma.fee.create({
                            data: {
                                feeType: 'Backlog Exam Registration Fee',
                                amount: 1500,
                                isPaid: false,
                                dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
                                userId: s.id,
                                remarks: 'Registration fee for PH101 Engineering Physics supplementary exam.'
                            }
                        })];
                case 49:
                    _e.sent();
                    _e.label = 50;
                case 50:
                    _b++;
                    return [3 /*break*/, 46];
                case 51:
                    createExamSuite = function (subj, dateStr) { return __awaiter(_this, void 0, void 0, function () {
                        var baseDate, caDate, midDate, ca, mid, final;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    baseDate = new Date(dateStr);
                                    caDate = new Date(baseDate);
                                    caDate.setMonth(caDate.getMonth() - 2);
                                    midDate = new Date(baseDate);
                                    midDate.setMonth(midDate.getMonth() - 1);
                                    return [4 /*yield*/, prisma.exam.create({ data: { subjectId: subj.id, date: caDate, maxMarks: 20, examType: 'CA' } })];
                                case 1:
                                    ca = _a.sent();
                                    return [4 /*yield*/, prisma.exam.create({ data: { subjectId: subj.id, date: midDate, maxMarks: 30, examType: 'Mid-Term' } })];
                                case 2:
                                    mid = _a.sent();
                                    return [4 /*yield*/, prisma.exam.create({ data: { subjectId: subj.id, date: baseDate, maxMarks: 50, examType: 'Final' } })];
                                case 3:
                                    final = _a.sent();
                                    return [2 /*return*/, [ca, mid, final]];
                            }
                        });
                    }); };
                    return [4 /*yield*/, createExamSuite(subjMath1, '2023-12-15')];
                case 52:
                    mathExams = _e.sent();
                    return [4 /*yield*/, createExamSuite(subjPhy, '2023-12-18')];
                case 53:
                    phyExams = _e.sent();
                    return [4 /*yield*/, createExamSuite(subjC, '2024-12-15')];
                case 54:
                    cExams = _e.sent();
                    return [4 /*yield*/, createExamSuite(subjDS, '2025-05-10')];
                case 55:
                    dsExams = _e.sent();
                    return [4 /*yield*/, createExamSuite(subjDB, '2025-05-12')];
                case 56:
                    dbExams = _e.sent();
                    _loop_1 = function (s) {
                        var isDemo, injectResults;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    if (!(s.departmentId === deptCSE.id)) return [3 /*break*/, 6];
                                    isDemo = s.id === demoUser.id;
                                    injectResults = function (exams_1) {
                                        var args_1 = [];
                                        for (var _i = 1; _i < arguments.length; _i++) {
                                            args_1[_i - 1] = arguments[_i];
                                        }
                                        return __awaiter(_this, __spreadArray([exams_1], args_1, true), void 0, function (exams, shouldFail) {
                                            var ca, mid, final, caMarks, midMarks, finalMarks, totalMarks, gradePoint;
                                            if (shouldFail === void 0) { shouldFail = false; }
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        ca = exams[0], mid = exams[1], final = exams[2];
                                                        caMarks = shouldFail ? Math.floor(Math.random() * 5 + 2) : Math.floor(Math.random() * 10 + 10);
                                                        midMarks = shouldFail ? Math.floor(Math.random() * 10 + 5) : Math.floor(Math.random() * 10 + 20);
                                                        finalMarks = shouldFail ? Math.floor(Math.random() * 15 + 5) : Math.floor(Math.random() * 15 + 35);
                                                        totalMarks = caMarks + midMarks + finalMarks;
                                                        gradePoint = 0;
                                                        if (!shouldFail) {
                                                            gradePoint = totalMarks >= 90 ? 10 : totalMarks >= 80 ? 9 : totalMarks >= 70 ? 8 : totalMarks >= 60 ? 7 : totalMarks >= 50 ? 6 : totalMarks >= 40 ? 5 : 0;
                                                        }
                                                        return [4 /*yield*/, prisma.studentResult.create({ data: { studentId: s.id, examId: ca.id, marksObtained: caMarks, gradePoint: 0 } })];
                                                    case 1:
                                                        _a.sent();
                                                        return [4 /*yield*/, prisma.studentResult.create({ data: { studentId: s.id, examId: mid.id, marksObtained: midMarks, gradePoint: 0 } })];
                                                    case 2:
                                                        _a.sent();
                                                        return [4 /*yield*/, prisma.studentResult.create({ data: { studentId: s.id, examId: final.id, marksObtained: finalMarks, gradePoint: gradePoint } })];
                                                    case 3:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        });
                                    };
                                    // Math: Pass
                                    return [4 /*yield*/, injectResults(mathExams, false)];
                                case 1:
                                    // Math: Pass
                                    _f.sent();
                                    // Physics: Demo user FAILS. Others pass.
                                    return [4 /*yield*/, injectResults(phyExams, isDemo)];
                                case 2:
                                    // Physics: Demo user FAILS. Others pass.
                                    _f.sent();
                                    // C Programming: Pass
                                    return [4 /*yield*/, injectResults(cExams, false)];
                                case 3:
                                    // C Programming: Pass
                                    _f.sent();
                                    // Current Sem (DS, DB): Pass
                                    return [4 /*yield*/, injectResults(dsExams, false)];
                                case 4:
                                    // Current Sem (DS, DB): Pass
                                    _f.sent();
                                    return [4 /*yield*/, injectResults(dbExams, false)];
                                case 5:
                                    _f.sent();
                                    _f.label = 6;
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    _c = 0, students_2 = students;
                    _e.label = 57;
                case 57:
                    if (!(_c < students_2.length)) return [3 /*break*/, 60];
                    s = students_2[_c];
                    return [5 /*yield**/, _loop_1(s)];
                case 58:
                    _e.sent();
                    _e.label = 59;
                case 59:
                    _c++;
                    return [3 /*break*/, 57];
                case 60:
                    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    createdSchedules = [];
                    _d = 0, days_1 = days;
                    _e.label = 61;
                case 61:
                    if (!(_d < days_1.length)) return [3 /*break*/, 65];
                    day = days_1[_d];
                    return [4 /*yield*/, prisma.schedule.create({ data: { dayOfWeek: day, startTime: '09:00', endTime: '10:00', subjectId: subjDS.id, facultyId: faculty1.id, roomId: r101.id, classSectionId: cseA.id } })];
                case 62:
                    sch1 = _e.sent();
                    return [4 /*yield*/, prisma.schedule.create({ data: { dayOfWeek: day, startTime: '10:15', endTime: '11:15', subjectId: subjDB.id, facultyId: faculty2.id, roomId: r102.id, classSectionId: cseA.id } })];
                case 63:
                    sch2 = _e.sent();
                    createdSchedules.push(sch1, sch2);
                    _e.label = 64;
                case 64:
                    _d++;
                    return [3 /*break*/, 61];
                case 65:
                    // 11. Notifications & Disciplinary specifically for Demo User
                    console.log('Seeding Targeted Disciplinary Records and Notifications...');
                    return [4 /*yield*/, prisma.disciplinaryRecord.create({
                            data: {
                                studentId: demoUser.id,
                                facultyId: faculty1.id,
                                severity: "Severe",
                                description: "Academic Misconduct: Caught plagiarizing in CS301 (Data Structures) CA assignment. Active academic hold placed on account.",
                                adminAction: "Summoned to HOD office. 0 Marks awarded for CA.",
                                status: "PENDING"
                            }
                        })];
                case 66:
                    _e.sent();
                    return [4 /*yield*/, prisma.notification.createMany({
                            data: [
                                {
                                    recipientId: demoUser.id,
                                    title: 'URGENT: Academic Hold Placed',
                                    message: 'An academic hold has been placed on your account due to a severe disciplinary record (Plagiarism in CA). Please contact the HOD (Dr. V.S.S. Murthy) in Room 204 immediately. You will not be able to download your hall ticket until this is resolved.',
                                    type: 'ACADEMIC',
                                    isRead: false
                                },
                                {
                                    recipientId: demoUser.id,
                                    title: 'Final Warning: Overdue Tuition Fee',
                                    message: 'Your tuition fee of ₹45,000 is heavily overdue. A late fee penalty of ₹2,500 has been applied to your ledger. Please pay this immediately through the Fee Portal or contact the Accounts Office (Ext 401).',
                                    type: 'FEE',
                                    isRead: false
                                },
                                {
                                    recipientId: demoUser.id,
                                    title: 'Backlog Registration Open',
                                    message: 'Registration for the PH101 (Engineering Physics) backlog examination is now open. You must pay the backlog exam registration fee of ₹1,500 by Friday to appear for the supplementary exam.',
                                    type: 'GENERAL',
                                    isRead: false
                                },
                                {
                                    recipientId: demoUser.id,
                                    title: 'Attendance Shortage Warning',
                                    message: 'Your current attendance is 68.5%, which is below the mandatory 75% threshold. You are in the condonation zone and must meet your class advisor immediately.',
                                    type: 'ATTENDANCE',
                                    isRead: false
                                }
                            ]
                        })];
                case 67:
                    _e.sent();
                    console.log('🎉 Database seeding complete!');
                    console.log("Successfully generated hyper-realistic demo persona for Arjun Reddy (209Y1A0501) with backlogs, CA/Mid marks, severe cases, and financial holds!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
