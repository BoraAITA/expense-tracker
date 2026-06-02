import { Header } from "@/components/layout/header";
import { ExpenseForm } from "@/components/expenses/expense-form";

export default function NewExpensePage() {
  return (
    <>
      <Header title="Yeni Gider" description="Yeni bir gider ekleyin" />
      <div className="p-4 sm:p-6">
        <ExpenseForm />
      </div>
    </>
  );
}
