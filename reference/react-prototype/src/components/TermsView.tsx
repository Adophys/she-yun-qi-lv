import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TermsViewProps {
  onBack: () => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onBack }) => {
  return (
    <div className="flex-1 flex flex-col bg-[#fdfaf7] max-w-md mx-auto min-h-screen select-none">
      {/* Top Header (Image 3) */}
      <div className="px-4 py-3 border-b border-slate-200/50 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <button
          id="terms-back-btn"
          onClick={() => {
            soundManager.playTap();
            onBack();
          }}
          className="p-1.5 text-slate-800 hover:bg-slate-100 rounded-full active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Title Header (Image 3) */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-[#0f172a] font-serif tracking-tight">
            服务条款与隐私政策
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">最后更新日期：2023年10月24日</p>
        </div>

        {/* Content Card (Image 3) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 text-xs text-slate-600 leading-relaxed text-justify">
          {/* Section 01 */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5 font-serif">
              <span className="text-red-600 font-mono text-base font-black">01.</span>
              <span>导言</span>
            </h3>
            <p>
              欢迎使用“畲韵奇旅”小程序（以下简称“本服务”）。本服务条款（“条款”）是您与本平台之间关于您下载、安装、使用本服务所订立的协议。请您务必审慎阅读、充分理解各条款内容，特别是免除或限制责任的相应条款。
            </p>
          </div>

          <div className="border-b border-dashed border-slate-200" />

          {/* Section 02 */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5 font-serif">
              <span className="text-red-600 font-mono text-base font-black">02.</span>
              <span>用户权利与义务</span>
            </h3>
            <p className="mb-2">
              2.1 您有权在遵守本条款的前提下，使用本服务提供的AR探索、文化打卡、虚拟藏品收集等功能。
            </p>
            <p>
              2.2 您理解并同意，本服务仅供您个人非商业性质的使用。您不得利用本服务进行任何违法或侵犯他人合法权益的行为，包括但不限于发布不良信息、恶意破解软件、干扰服务器运行等。
            </p>
          </div>

          <div className="border-b border-dashed border-slate-200" />

          {/* Section 03 */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5 font-serif">
              <span className="text-red-600 font-mono text-base font-black">03.</span>
              <span>隐私及数据保护</span>
            </h3>
            <p className="mb-2">
              3.1 <strong className="text-slate-900">位置信息</strong>：为了提供核心的实景AR导览与打卡功能，我们需要获取您的精确地理位置信息。您可以通过系统设置拒绝提供，但这将导致部分核心功能无法使用。
            </p>
            <p className="mb-2">
              3.2 <strong className="text-slate-900">相机权限</strong>：扫描实物及体验增强现实（AR）互动需要访问您的设备相机。我们不会在未经您允许的情况下录制或上传您的视频画面。
            </p>
            <p>
              3.3 <strong className="text-slate-900">信息安全</strong>：我们致力于保护您的个人信息安全。我们将采取适当的物理、技术和管理措施来保护您的数据免受未经授权的访问、使用或泄露。
            </p>
          </div>

          <div className="border-b border-dashed border-slate-200" />

          {/* Section 04 */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5 font-serif">
              <span className="text-red-600 font-mono text-base font-black">04.</span>
              <span>知识产权声明</span>
            </h3>
            <p>
              本服务中包含的所有内容（包括但不限于文化图腾、UI设计、3D模型、文本、图像、音频）的知识产权均归属于“畲韵奇旅”开发团队或相关权利人所有。未经事先书面许可，任何人不得擅自使用、复制或修改。
            </p>
          </div>

          <div className="border-b border-dashed border-slate-200" />

          {/* Section 05 */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5 font-serif">
              <span className="text-red-600 font-mono text-base font-black">05.</span>
              <span>联系我们</span>
            </h3>
            <p>
              如果您对本政策有任何疑问、意见或建议，或希望行使您的数据主体权利，请通过“我的”页面中的“联系客服”功能与我们取得联系。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
