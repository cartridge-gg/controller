use starknet::core::types::FieldElement;

pub struct CallSequence {
    calls: Vec<[FieldElement; 4]>,
}

impl Default for CallSequence {
    fn default() -> Self {
        Self {
            calls: vec![[FieldElement::default(); 4]],
        }
    }
}

impl From<CallSequence> for Vec<FieldElement> {
    fn from(val: CallSequence) -> Self {
        let mut result = Vec::new();
        result.push(val.calls.len().into());
        result.extend(val.calls.into_iter().flatten());
        result
    }
}
