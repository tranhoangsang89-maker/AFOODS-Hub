import { useState } from 'react';
import { X, Send, Building2, User, Mail, Phone, Globe, Package, Loader2 } from 'lucide-react';

const PRODUCTS = [
  'Potato Wrapped PTO Shrimp (Tôm cuộn khoai tây)',
  'Money Bag Hargao & Dimsum (Há cảo túi tiền)',
  'Collique Scallop Farci & Crab Farci (Sò điệp / Cua Farci)',
  'Sushi Neta (Tsubu-gai, Harasu, AkaIka)',
  'Springroll & Shrimp Paste (Chả giò & Chạo tôm)',
  'Wonton & Shaomai / Breaded (Hoành thánh, Xíu mại, Tẩm bột)',
  'Tôm đông lạnh Sú / Thẻ (Black Tiger & Vannamei Shrimp)',
  'Cá Basa & Cá biển đông lạnh (Frozen Pangasius & Sea Fish)',
  'Mực đông lạnh (Frozen Squid - Rings/Tubes/Tentacles)',
  'Đơn hàng hỗn hợp container (Mixed Container Inquiry)',
];

const COUNTRIES = [
  'United States', 'Japan', 'China', 'South Korea', 'Australia',
  'United Kingdom', 'Germany', 'France', 'Belgium', 'Netherlands',
  'Canada', 'Singapore', 'Thailand', 'Vietnam', 'Other',
];

export default function InquiryModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    buyer_name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    product_interest: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.buyer_name.trim()) errs.buyer_name = 'Vui lòng nhập tên';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.company.trim()) errs.company = 'Vui lòng nhập tên công ty';
    if (!form.product_interest) errs.product_interest = 'Vui lòng chọn sản phẩm';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate network
    onSubmit(form);
    setIsSubmitting(false);
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-lg glass-dark border border-slate-700/50 rounded-t-3xl sm:rounded-2xl overflow-hidden animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-dark border-b border-slate-700/30 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">📋 Gửi Yêu Cầu Mua Hàng</h3>
            <p className="text-xs text-slate-400 mt-0.5">AFOODS sẽ phản hồi trong 24h làm việc</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Name & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                <User size={11} className="inline mr-1" /> Họ tên / Full Name *
              </label>
              <input
                type="text"
                value={form.buyer_name}
                onChange={set('buyer_name')}
                placeholder="James Thompson"
                className={`input-field text-sm py-2.5 ${errors.buyer_name ? 'border-red-500' : ''}`}
              />
              {errors.buyer_name && <p className="text-red-400 text-[11px] mt-1">{errors.buyer_name}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                <Building2 size={11} className="inline mr-1" /> Công ty / Company *
              </label>
              <input
                type="text"
                value={form.company}
                onChange={set('company')}
                placeholder="Pacific Foods Ltd."
                className={`input-field text-sm py-2.5 ${errors.company ? 'border-red-500' : ''}`}
              />
              {errors.company && <p className="text-red-400 text-[11px] mt-1">{errors.company}</p>}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                <Mail size={11} className="inline mr-1" /> Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="james@company.com"
                className={`input-field text-sm py-2.5 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                <Phone size={11} className="inline mr-1" /> Điện thoại / Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+1 415 555 0192"
                className="input-field text-sm py-2.5"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              <Globe size={11} className="inline mr-1" /> Quốc gia / Country
            </label>
            <select value={form.country} onChange={set('country')} className="input-field text-sm py-2.5">
              <option value="">-- Select Country --</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              <Package size={11} className="inline mr-1" /> Sản phẩm quan tâm *
            </label>
            <select
              value={form.product_interest}
              onChange={set('product_interest')}
              className={`input-field text-sm py-2.5 ${errors.product_interest ? 'border-red-500' : ''}`}
            >
              <option value="">-- Select Product --</option>
              {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.product_interest && <p className="text-red-400 text-[11px] mt-1">{errors.product_interest}</p>}
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Yêu cầu chi tiết / Message</label>
            <textarea
              value={form.message}
              onChange={set('message')}
              placeholder="Số lượng cần, kích cỡ, chứng nhận yêu cầu, cảng giao hàng..."
              rows={3}
              className="input-field text-sm resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-sm font-medium">
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <><Loader2 size={15} className="animate-spin" /> Đang gửi...</>
              ) : (
                <><Send size={15} /> Gửi Yêu Cầu</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
