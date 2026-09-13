import { createPortal } from "react-dom";

function TicketModal({ open = false }) {
  return createPortal(
    <section className={`ticket-overlay${open ? " is-open" : ""}`} id="ticket-dialog" role="dialog" aria-modal="true" aria-labelledby="ticket-title">
      <div className="ticket-dialog">
        <a className="ticket-close" href={open ? "./index.html" : "#"} aria-label="关闭抢票须知">×</a>
        <div className="ticket-rules">
          <h2 id="ticket-title">抢票须知</h2>
          <ol>
            <li><b>01</b><div><h3>实名抢票</h3><p>请使用本人真实信息提交抢票申请，<br />入场信息须与有效证件一致。</p></div></li>
            <li><b>02</b><div><h3>名额有限，审核入场</h3><p>各场活动名额有限，提交申请后请耐心<br />等待大会组委会审核。</p></div></li>
            <li><b>03</b><div><h3>凭证入场</h3><p>审核通过后，请在小程序内查看电子<br />入场凭证，并凭证扫码入场。</p></div></li>
          </ol>
        </div>
        <div className="ticket-scan">
          <h2>微信扫码抢票</h2>
          <p>微信扫一扫，进入大会小程序提交抢票申请</p>
          <img src="./assets/registration-qr.png" alt="大会小程序抢票二维码" />
          <p>审核通过后即可在小程序内领取电子票</p>
          <strong>联系大会：0769–2289 8888</strong>
        </div>
      </div>
    </section>
  , document.body);
}

export { TicketModal };
