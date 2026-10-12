import { redirect } from "next/navigation";

/** @deprecated Prefer /alerts — kept so existing links still work. */
const ManagerAttentionPage = () => {
  redirect("/alerts");
};

export default ManagerAttentionPage;
