import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Clock, CheckCircle, AlertCircle, LogIn, LogOut, Navigation, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import { checkGeofence, getCurrentPosition, formatDistance, getBearing } from '../../utils/geo';
import { db } from '../../data/db';
import LoginForm from './LoginForm';
import MapView from './MapView';

const SHIFTS = [
  { value: 'CA_NGAY', label: '☀️ Ca Ngày (6:00 - 14:00)' },
  { value: 'CA_DEM', label: '🌙 Ca Đêm (22:00 - 6:00)' },
  { value: 'TANG_CA', label: '⏰ Tăng Ca' },
];

function RadarAnimation({ inside }) {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <div className={`radar-ring ${inside ? '' : 'opacity-30'}`} style={{ width: 20, height: 20 }} />
      <div className={`radar-ring ${inside ? '' : 'opacity-20'}`} style={{ width: 20, height: 20 }} />
      <div className={`radar-ring ${inside ? '' : 'opacity-10'}`} style={{ width: 20, height: 20 }} />
      <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
        inside
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 glow-green'
          : 'bg-gradient-to-br from-orange-500 to-red-600 glow-red'
      }`}>
        <MapPin size={22} className="text-white" />
      </div>
    </div>
  );
}

export default function AttendanceModule({ currentUser, onLogin, showToast }) {
  const [gpsStatus, setGpsStatus] = useState(null); // null | 'loading' | 'inside' | 'outside' | 'error'
  const [gpsData, setGpsData] = useState(null);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [selectedShift, setSelectedShift] = useState('CA_NGAY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [factoryConfig, setFactoryConfig] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const config = db.getFactoryConfig();
    setFactoryConfig(config);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const active = db.getActiveCheckIn(currentUser.id);
      setActiveCheckIn(active);
    }
  }, [currentUser]);

  // Elapsed timer when checked in
  useEffect(() => {
    if (activeCheckIn) {
      const update = () => {
        const diff = Date.now() - new Date(activeCheckIn.check_in_time).getTime();
        setElapsed(diff);
      };
      update();
      timerRef.current = setInterval(update, 1000);
    } else {
      clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [activeCheckIn]);

  const formatElapsed = (ms) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const checkGPS = async () => {
    setGpsStatus('loading');
    try {
      const pos = await getCurrentPosition();
      const { latitude, longitude } = pos.coords;
      const config = factoryConfig || db.getFactoryConfig();
      const { inside, distance } = checkGeofence(
        latitude, longitude,
        config.latitude, config.longitude,
        config.radius_meters
      );
      const bearing = getBearing(latitude, longitude, config.latitude, config.longitude);
      setGpsData({ latitude, longitude, distance, inside, bearing, accuracy: Math.round(pos.coords.accuracy), simulated: false });
      setGpsStatus(inside ? 'inside' : 'outside');
    } catch (err) {
      setGpsStatus('error');
      showToast('Không thể lấy vị trí GPS. Hãy cho phép truy cập vị trí.', 'error');
    }
  };

  const simulatePosition = (type) => {
    const config = factoryConfig || db.getFactoryConfig();
    let lat, lng;
    if (type === 'inside') {
      lat = config.latitude + 0.0001;
      lng = config.longitude + 0.0001;
    } else {
      lat = config.latitude + 0.12;
      lng = config.longitude + 0.12;
    }
    const { inside, distance } = checkGeofence(
      lat, lng,
      config.latitude, config.longitude,
      config.radius_meters
    );
    const bearing = getBearing(lat, lng, config.latitude, config.longitude);
    setGpsData({ latitude: lat, longitude: lng, distance, inside, bearing, accuracy: 5, simulated: true });
    setGpsStatus(inside ? 'inside' : 'outside');
    if (inside) {
      showToast('🏢 Vị trí giả lập: Trong Nhà máy AFOODS (Đồng Tháp)', 'success');
    } else {
      showToast('🚗 Vị trí giả lập: Ngoài phạm vi Nhà máy (15km)', 'warning');
    }
  };

  const handleCheckInOut = async () => {
    if (!gpsData) return;
    if (!currentUser) { showToast('Vui lòng đăng nhập trước.', 'warning'); return; }
    setIsSubmitting(true);

    try {
      await new Promise(r => setTimeout(r, 600)); // Simulate API
      const result = db.checkIn(currentUser.id, {
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        distance_meters: gpsData.distance,
        shift_type: selectedShift,
        status: gpsData.inside ? 'VALID' : 'INVALID',
      });

      if (result.action === 'check_in') {
        setActiveCheckIn(result.log);
        showToast(`✅ Chấm công VÀO thành công! ${new Date().toLocaleTimeString('vi-VN')}`, 'success');
      } else {
        setActiveCheckIn(null);
        showToast(`✅ Chấm công RA thành công! Tổng: ${result.log.total_hours}h`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.', 'error');
    }
    setIsSubmitting(false);
  };

  if (!currentUser) {
    return <LoginForm onLogin={onLogin} showToast={showToast} />;
  }

  return (
    <div className="max-w-lg mx-auto px-3 py-4 sm:py-6 space-y-4 sm:space-y-5 animate-fade-in">
      {/* Worker Identity Card */}
      <div className="card border border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-lg">
            {currentUser.full_name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-base truncate">{currentUser.full_name}</div>
            <div className="text-slate-400 text-sm">{currentUser.department}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge-blue text-[11px]">{currentUser.emp_code}</span>
              {activeCheckIn && (
                <span className="badge-green text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang làm việc
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-slate-400">
            <Clock size={14} className="inline mr-1" />
            <span className="tabular-nums">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Active Check-in Timer */}
      {activeCheckIn && (
        <div className="glass border border-emerald-500/30 rounded-2xl p-4 text-center animate-fade-in">
          <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">⏱ Thời gian làm việc hôm nay</div>
          <div className="text-4xl font-black text-white tabular-nums mb-1">{formatElapsed(elapsed)}</div>
          <div className="text-slate-400 text-xs">
            Vào lúc: {new Date(activeCheckIn.check_in_time).toLocaleTimeString('vi-VN')} ·{' '}
            {SHIFTS.find(s => s.value === activeCheckIn.shift_type)?.label.split(' (')[0]}
          </div>
        </div>
      )}

      {/* GPS Status Card */}
      <div className="card border border-slate-700/50">
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-4 font-medium">
            📍 {factoryConfig?.factory_name || 'AFOODS Factory'}
          </div>

          <div className="flex justify-center mb-4">
            <RadarAnimation inside={gpsStatus === 'inside'} />
          </div>

          {/* GPS Status Messages */}
          {gpsStatus === null && (
            <div className="space-y-1 mb-4">
              <p className="text-slate-300 text-sm font-medium">Nhấn để kiểm tra vị trí GPS</p>
              <p className="text-slate-500 text-xs">Bán kính cho phép: {factoryConfig?.radius_meters || 200}m</p>
            </div>
          )}

          {gpsStatus === 'loading' && (
            <div className="flex items-center justify-center gap-2 text-teal-400 mb-4">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Đang xác định vị trí...</span>
            </div>
          )}

          {gpsStatus === 'inside' && gpsData && (
            <div className="space-y-3 mb-4 animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <CheckCircle size={18} />
                <span className="font-bold text-base">Bạn đang ở trong nhà máy AFOODS</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                  <div className="text-emerald-400 font-bold text-sm">{formatDistance(gpsData.distance)}</div>
                  <div className="text-slate-500 text-[10px]">Khoảng cách</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                  <div className="text-emerald-400 font-bold text-sm">{gpsData.accuracy}m</div>
                  <div className="text-slate-500 text-[10px]">Độ chính xác</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                  <div className="text-emerald-400 font-bold text-sm">{gpsData.bearing}</div>
                  <div className="text-slate-500 text-[10px]">Hướng nhà máy</div>
                </div>
              </div>
            </div>
          )}

          {gpsStatus === 'outside' && gpsData && (
            <div className="space-y-3 mb-4 animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-orange-400">
                <AlertCircle size={18} />
                <span className="font-bold text-base">Nằm ngoài vị trí cho phép</span>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                <div className="text-orange-300 text-sm font-semibold">
                  Cách nhà máy: <span className="text-xl font-black">{formatDistance(gpsData.distance)}</span>
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  Hướng nhà máy: {gpsData.bearing} · Vui lòng di chuyển đến trong phạm vi {factoryConfig?.radius_meters || 200}m
                </div>
              </div>
            </div>
          )}

          {gpsStatus === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-center">
              <p className="text-red-400 text-sm font-medium">Không thể lấy vị trí GPS</p>
              <p className="text-slate-500 text-xs mt-1">Vui lòng cấp quyền truy cập vị trí trong cài đặt trình duyệt</p>
            </div>
          )}

          {/* Get GPS Button */}
          {gpsStatus !== 'inside' && gpsStatus !== 'outside' && (
            <button
              onClick={checkGPS}
              disabled={gpsStatus === 'loading'}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 touch-target"
            >
              {gpsStatus === 'loading' ? (
                <><Loader2 size={16} className="animate-spin" /> Đang xác định vị trí...</>
              ) : (
                <><Navigation size={16} /> Kiểm Tra Vị Trí GPS</>
              )}
            </button>
          )}

          {(gpsStatus === 'inside' || gpsStatus === 'outside') && (
            <div className="flex items-center justify-center gap-3 mb-2">
              <button
                onClick={checkGPS}
                className="text-xs text-slate-400 hover:text-teal-400 transition-colors underline flex items-center gap-1"
              >
                🔄 Cập nhật GPS thật
              </button>
            </div>
          )}

          {/* Demo Simulation Controls for QA / Testing */}
          <div className="mt-3 pt-3 border-t border-slate-700/40 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-slate-400 font-medium">🧪 Chế độ Thử nghiệm / Demo:</span>
              {gpsData?.simulated && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  Đang giả lập
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => simulatePosition('inside')}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all text-center ${
                  gpsData?.simulated && gpsStatus === 'inside'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-emerald-500/40'
                }`}
              >
                🏢 Tại Nhà Máy (15m)
              </button>
              <button
                type="button"
                onClick={() => simulatePosition('outside')}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all text-center ${
                  gpsData?.simulated && gpsStatus === 'outside'
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-orange-500/40'
                }`}
              >
                🚗 Ngoài Nhà Máy (15km)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Selection */}
      {!activeCheckIn && (
        <div className="card border border-slate-700/50">
          <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Chọn ca làm việc</label>
          <div className="grid grid-cols-1 gap-2">
            {SHIFTS.map((shift) => (
              <button
                key={shift.value}
                onClick={() => setSelectedShift(shift.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  selectedShift === shift.value
                    ? 'bg-gradient-to-r from-indigo-500/20 to-blue-600/10 border-indigo-500/40 text-indigo-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full border-2 transition-all ${selectedShift === shift.value ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`} />
                {shift.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Check In / Out Button */}
      <div className="space-y-3">
        {gpsStatus === 'inside' || (gpsStatus === 'outside' && activeCheckIn) ? (
          <button
            onClick={handleCheckInOut}
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] touch-target shadow-2xl ${
              activeCheckIn
                ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
            } disabled:opacity-50`}
            style={{
              boxShadow: activeCheckIn
                ? '0 8px 30px rgba(239, 68, 68, 0.4)'
                : '0 8px 30px rgba(5, 150, 105, 0.4)',
            }}
          >
            {isSubmitting ? (
              <><Loader2 size={22} className="animate-spin" /> Đang xử lý...</>
            ) : activeCheckIn ? (
              <><LogOut size={22} /> CHẤM CÔNG RA</>
            ) : (
              <><LogIn size={22} /> CHẤM CÔNG VÀO</>
            )}
          </button>
        ) : gpsStatus === 'outside' ? (
          <div className="w-full py-5 rounded-2xl bg-slate-800/50 border border-slate-700 text-slate-500 font-semibold text-base flex items-center justify-center gap-2 text-center">
            <AlertCircle size={18} />
            <span>Nằm ngoài phạm vi nhà máy<br /><span className="text-xs font-normal">Di chuyển đến gần nhà máy để chấm công</span></span>
          </div>
        ) : null}

        {/* Map Toggle */}
        <button
          onClick={() => setShowMap(!showMap)}
          className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 hover:border-teal-500/40 hover:text-teal-400 text-sm font-medium flex items-center justify-center gap-2 transition-all"
        >
          <MapPin size={15} />
          {showMap ? 'Ẩn bản đồ' : 'Xem bản đồ nhà máy'}
          <ChevronDown size={14} className={`transition-transform ${showMap ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Map View */}
      {showMap && factoryConfig && (
        <div className="animate-fade-in">
          <MapView
            factoryConfig={factoryConfig}
            userPosition={gpsData ? { lat: gpsData.latitude, lng: gpsData.longitude } : null}
          />
        </div>
      )}

      {/* Today's Log Preview */}
      {currentUser && <TodayLog userId={currentUser.id} />}
    </div>
  );
}

function TodayLog({ userId }) {
  const today = new Date().toISOString().split('T')[0];
  const logs = db.getAttendanceLogs({ date: today }).filter(l => l.user_id === userId);

  if (logs.length === 0) return null;

  return (
    <div className="card border border-slate-700/50 animate-fade-in">
      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">📅 Lịch sử chấm công hôm nay</div>
      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} className="flex items-center justify-between py-2.5 px-3 bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${log.status === 'VALID' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
              <div>
                <div className="text-slate-200 text-sm font-medium">
                  Vào: {new Date(log.check_in_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  {log.check_out_time && (
                    <> → Ra: {new Date(log.check_out_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</>
                  )}
                </div>
                <div className="text-slate-500 text-xs">{SHIFTS.find(s => s.value === log.shift_type)?.label.split(' (')[0]}</div>
              </div>
            </div>
            <div className="text-right">
              {log.total_hours && <div className="text-teal-400 font-bold text-sm">{log.total_hours}h</div>}
              <div className={`text-[11px] ${log.status === 'VALID' ? 'text-emerald-500' : 'text-orange-500'}`}>
                {log.status === 'VALID' ? '✓ Hợp lệ' : '⚠ Ngoài phạm vi'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
