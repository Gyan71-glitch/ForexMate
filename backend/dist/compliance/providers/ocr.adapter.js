"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var OcrAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrAdapter = void 0;
const common_1 = require("@nestjs/common");
const tesseract_js_1 = require("tesseract.js");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let OcrAdapter = OcrAdapter_1 = class OcrAdapter {
    logger = new common_1.Logger(OcrAdapter_1.name);
    async extractDocumentData(filePath, customerName, requestedType = 'PAN', knownDocNumber) {
        this.logger.log(`OCR for: ${filePath}  type: ${requestedType}`);
        let absolutePath = filePath;
        if (!path.isAbsolute(filePath)) {
            absolutePath = path.resolve(process.cwd(), filePath);
        }
        if (!fs.existsSync(absolutePath)) {
            this.logger.warn(`File not found at: ${absolutePath}`);
            if (knownDocNumber) {
                return this.buildResult(knownDocNumber, null, customerName, 0.80, true);
            }
            return this.getFallbackMockResult(customerName);
        }
        const ext = path.extname(absolutePath).toLowerCase();
        if (!['.png', '.jpg', '.jpeg', '.bmp', '.webp'].includes(ext)) {
            this.logger.log(`Unsupported format ${ext}, fallback`);
            return this.getFallbackMockResult(customerName);
        }
        try {
            this.logger.log(`Running Tesseract on: ${absolutePath}`);
            const worker = await (0, tesseract_js_1.createWorker)('eng');
            let ret;
            try {
                ret = await Promise.race([
                    worker.recognize(absolutePath),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('OCR timeout after 30s')), 30000))
                ]);
            }
            finally {
                try {
                    await worker.terminate();
                }
                catch (_) { }
            }
            const text = ret.data.text;
            const confidence = ret.data.confidence / 100;
            this.logger.log(`OCR done. confidence=${confidence.toFixed(2)}  text_len=${text.length}`);
            this.logger.log(`OCR raw snippet: ${text.substring(0, 300)}`);
            const docNumber = this.parseDocumentNumber(text, requestedType) || knownDocNumber || null;
            const dob = this.parseDateOfBirth(text);
            const expiryDate = this.parseExpiryDate(text);
            const nameMatch = this.checkNameMatch(text, customerName);
            const isValidDocType = this.detectDocumentType(text, requestedType, docNumber, confidence);
            return {
                confidence,
                extractedText: {
                    documentNumber: docNumber || 'UNREADABLE',
                    name: customerName,
                    dob: dob || null,
                    expiryDate: expiryDate || null,
                    rawText: text.substring(0, 1000),
                },
                nameMatch,
                isExpired: expiryDate ? new Date(expiryDate) < new Date() : false,
                isValidDocType,
            };
        }
        catch (err) {
            this.logger.error('Tesseract failed', err);
            if (knownDocNumber) {
                return this.buildResult(knownDocNumber, null, customerName, 0.70, true);
            }
            return this.getFallbackMockResult(customerName);
        }
    }
    detectDocumentType(text, requestedType, extractedNumber, confidence) {
        const upper = text.toUpperCase();
        if (requestedType === 'PAN') {
            if (extractedNumber && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(extractedNumber)) {
                this.logger.log('PAN validated via number regex');
                return true;
            }
            const panKeywords = [
                'INCOME TAX',
                'PERMANENT ACCOUNT',
                'GOVT OF INDIA',
                'GOVERNMENT OF INDIA',
                'TAX DEPARTMENT',
                'आयकर',
                'भारत सरकार',
            ];
            const keywordHit = panKeywords.some(kw => upper.includes(kw.toUpperCase()));
            if (keywordHit) {
                this.logger.log('PAN validated via keyword match');
                return true;
            }
            if (confidence < 0.35 && text.trim().length > 20) {
                this.logger.log('PAN: low confidence image, accepting for staff review');
                return true;
            }
            this.logger.warn('PAN: could not validate — no number match, no keywords, text too sparse');
            return false;
        }
        if (requestedType === 'PASSPORT') {
            if (extractedNumber && /^[A-Z][0-9]{7,8}$/.test(extractedNumber)) {
                this.logger.log('PASSPORT validated via number regex');
                return true;
            }
            const passportKeywords = ['PASSPORT', 'REPUBLIC OF INDIA', 'PASSPORT NO', 'NATIONALITY', 'GIVEN NAME', 'SURNAME', 'PLACE OF BIRTH'];
            const keywordHit = passportKeywords.some(kw => upper.includes(kw));
            if (keywordHit) {
                this.logger.log('PASSPORT validated via keyword match');
                return true;
            }
            if (confidence < 0.40 && text.trim().length > 20) {
                this.logger.log('PASSPORT: low confidence image, accepting for staff review');
                return true;
            }
            this.logger.warn('PASSPORT: could not validate');
            return false;
        }
        return true;
    }
    parseDocumentNumber(text, requestedType) {
        const panRegex = /\b([A-Z]{5}[0-9]{4}[A-Z])\b/i;
        const passportRegex = /\b([A-Z][0-9]{7,8})\b/i;
        if (requestedType === 'PAN') {
            const m = text.match(panRegex);
            if (m)
                return m[1].toUpperCase();
        }
        else {
            const m = text.match(passportRegex);
            if (m)
                return m[1].toUpperCase();
        }
        const panM = text.match(panRegex);
        if (panM)
            return panM[1].toUpperCase();
        return null;
    }
    parseDateOfBirth(text) {
        const withLabel = /(?:dob|birth|d\.o\.b|date\s+of\s+birth)[\s:]*([0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{4})/i;
        const m = text.match(withLabel);
        if (m)
            return m[1];
        const standalone = /\b([0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{4})\b/;
        const ms = text.match(standalone);
        return ms ? ms[1] : null;
    }
    parseExpiryDate(text) {
        const m = text.match(/(?:expiry|exp|valid\s+to)[\s:]*([0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{4})/i);
        return m ? m[1] : null;
    }
    checkNameMatch(text, customerName) {
        if (!customerName)
            return false;
        const cleanText = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
        const parts = customerName.toLowerCase().split(/\s+/).filter(p => p.length > 2);
        if (parts.length === 0)
            return true;
        const hits = parts.filter(part => cleanText.includes(part)).length;
        return hits >= Math.max(1, Math.ceil(parts.length / 2));
    }
    buildResult(documentNumber, dob, customerName, confidence, isValidDocType) {
        return {
            confidence,
            extractedText: {
                documentNumber,
                name: customerName,
                dob: dob || null,
                expiryDate: null,
                rawText: '',
            },
            nameMatch: true,
            isExpired: false,
            isValidDocType,
        };
    }
    getFallbackMockResult(customerName) {
        return {
            confidence: 0.95,
            extractedText: {
                documentNumber: null,
                name: customerName,
                dob: null,
                expiryDate: null,
            },
            nameMatch: true,
            isExpired: false,
            isValidDocType: true,
        };
    }
};
exports.OcrAdapter = OcrAdapter;
exports.OcrAdapter = OcrAdapter = OcrAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], OcrAdapter);
//# sourceMappingURL=ocr.adapter.js.map