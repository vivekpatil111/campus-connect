// ... (keep existing imports and code)

  {/* Company Selection */}
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      <Building className="w-4 h-4" />
      Select Company
    </label>
    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
      <SelectTrigger>
        <SelectValue placeholder="Select a company" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.value} value={company.value}>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded ${company.color}`}>
                <span className="font-bold">{company.logo}</span>  {/* Changed from company.icon to company.logo */}
              </div>
              <span>{company.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* ... (keep rest of the code the same) */}