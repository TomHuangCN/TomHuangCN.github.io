import React from "react";

const Cooperation: React.FC = () => {
  return (
    <div>
      <h2>业务合作</h2>
      <p>请通过邮箱 huangtong.ht@qq.com 联系我。</p>
      <div style={{ marginTop: "24px" }}>
        <p>添加微信：</p>
        <img
          src="/assets/wechat-qr.png"
          alt="微信二维码"
          style={{
            width: "180px",
            borderRadius: "8px",
            border: "1px solid #eee",
          }}
        />
      </div>
    </div>
  );
};

export default Cooperation;
