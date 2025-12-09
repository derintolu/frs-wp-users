

import { MailComp } from "@/components/inbox/mail"
import { accounts, mails } from "@/admin/pages/inbox/data"

export default function MailPage() {


  return (
    <>
     
      <div className="hidden flex-col dark:bg-gray-900 md:flex">
        <MailComp
          accounts={accounts}
          defaultCollapsed={false}
          defaultLayout={[265, 440, 655]}
          mails={mails}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}