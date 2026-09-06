import ProductCatalogue from "@/components/ProductCatalogue";
import "./medicines.css";

export default function MedicinesPage() {
  return (
    <ProductCatalogue
      title="Medicines"
      intro="Search and filter the complete medicine catalogue."
      includePrescriptionFilter
    />
  );
}
