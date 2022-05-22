class WordGroup {
    constructor(words, completionItemKind, showSuggestion, documentations, selfcalls, type) {
        this.words = words // array of words
        this.completionItemKind = completionItemKind
        this.documentations = documentations // array, same length as words, defines documentation for each word
        this.selfcalls = selfcalls // array, same length as words, defines if that word should use : instead of .
        this.type = type // class type of wordgroup
        if (showSuggestion == undefined) {
            this.showSuggestion = true
        }
        else {
            this.showSuggestion = showSuggestion
        }
        this.subgroups = []
    }
    addSubGroup(group) {
        this.subgroups.push(group)
    }
}

module.exports = WordGroup;