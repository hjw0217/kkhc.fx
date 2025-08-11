import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Empty component
export function Empty() {
  return (
    <div className={cn("flex h-full items-center justify-center text-gray-500")}>
      <div className="text-center space-y-4">
        <i className="fa-solid fa-music text-5xl text-gray-300"></i>
        <h3 className="text-xl font-medium">暂无分析记录</h3>
        <p className="text-gray-400">上传您的第一个唱歌音频文件开始分析</p>
      </div>
    </div>
  );
}