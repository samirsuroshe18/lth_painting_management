
const Row = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-slate-900 break-words">{value}</p>
    </div>
  );
};

export default Row;
